var currentState = '';
var currentTerms;
var currentURL;
var jsonData;
var doLog = false;
var alternateWindow = false;
var windowBeforeUpdateState = false;

var DATA_URL = 'https://api.myjson.com/bins/4e30w';

//First time running script to check what value runState is in chrome storage.
//If runState is undefined it is gets set to enabled otherwise it gets the value.
chrome.storage.sync.get( 'runState', function(data) {
    currentState = data.runState;

    if( doLog ){
        console.log( 'val: ', currentState );
    }

    if( typeof enabled === 'undefined' ){
        currentState = 'enabled';
        chrome.storage.sync.set( {
            runState: currentState
        }, function () {
            if( doLog ){
                console.log( 'Saved', 'runState', currentState );
            }
        });
    }

    return true;
});

chrome.windows.onRemoved.addListener( function( windowId ){
    console.log( 'Window removed' );

    if( windowId === alternateWindow.id ){
        chrome.windows.update( windowBeforeUpdateState.id, {
            left: windowBeforeUpdateState.left,
            top: windowBeforeUpdateState.top,
            width: windowBeforeUpdateState.width,
            height: windowBeforeUpdateState.height,
            focused: windowBeforeUpdateState.focused
        } );

        alternateWindow = false;
    }
} );

var xhr = new XMLHttpRequest();
xhr.open( 'GET', DATA_URL, true );
xhr.onreadystatechange = function() {
    if ( xhr.readyState === 4 && xhr.status === 200 ) {
        jsonData = JSON.parse( xhr.responseText );
    }
}
xhr.send();

function showWindows(request , index){
    if( typeof currentURL !== 'undefined' && typeof currentTerms !== 'undefined' ){
        var link = currentURL + currentTerms[index][request.term];

        if( doLog ){
            console.log( 'Link: ' , link );
        }

        chrome.windows.getCurrent( {}, function( window ){
            if( doLog ){
                console.log( window );
            }

            windowBeforeUpdateState = window;

            if( alternateWindow === false ){
                chrome.windows.create( {
                    height: parseInt(window.height),
                    left: parseInt(window.width / 2 + 8),
                    state: 'normal',
                    top: parseInt(0),
                    type: 'normal',
                    url: link,
                    width: parseInt(window.width / 2 + 8)
                }, function( createdWindowData ) {
                    alternateWindow = createdWindowData;
                    console.log( alternateWindow );
                });
            } else {
                console.log( 'Should update alternate window' );
                chrome.tabs.update( alternateWindow.tabs[ 0 ].id, {
                    url: link
                });
            }

            chrome.windows.update( window.id, {
                height: parseInt(window.height),
                state: 'normal',
                width: parseInt(window.width / 2 + 8)
            });
        });
    } else {
        if( doLog ){
            console.log( 'currentURL and/or currentTerms is undefined' );
        }
    }
}

function getSelector( request, sender, sendResponse ){
    //content script is asking for selector
    var url = request.url;
    var currentEngine;

    // Loop over all engines
    if( typeof jsonData !== 'undefined' && typeof url !== 'undefined' ){
        for( var i = 0; i < jsonData.engines.length; i = i + 1 ){
            var matchCount = 0;

            // Loop over all required matches for the engine
            for( var matchIndex = 0; matchIndex < jsonData.engines[ i ].match.length; matchIndex = matchIndex + 1 ){
                if( url.indexOf( jsonData.engines[ i ].match[ matchIndex ] ) > -1 ){
                    // We have a match, increment our counter
                    matchCount = matchCount + 1;
                    if( doLog ){
                        console.log('found match, matchCount: ', matchCount);
                    }
                }
            }

            // If we have the same number of matches as required matches we have a valid site
            if( matchCount === jsonData.engines[ i ].match.length ){
                if( doLog ){
                    console.log( 'Valid site' );
                }

                currentEngine = jsonData.engines[ i ];
                currentTerms = [];
                for(var key in jsonData.terms[currentEngine.terms]){
                    currentTerms.push(jsonData.terms[currentEngine.terms][key]);
                }

                currentURL = currentEngine.url;

                sendResponse({
                    selectorSearchField: currentEngine.selectors.input,
                    selectorButton: currentEngine.selectors.button,
                    selectorAutoComplete: currentEngine.selectors.autocomplete,
                    englishTerms: jsonData.terms[currentEngine.terms].eng
                });

                return true;
            }
        }

        if( doLog ){
            console.log( 'If not valid site, Url:', url );
        }

        sendResponse({
            selectorSearchField: false
        });
    }
}

chrome.runtime.onMessage.addListener(
    function( request, sender, sendResponse ) {
        //From content script
        if( request.action === 'getRunState' ){
            chrome.storage.sync.get( 'runState', function(data) {
                sendResponse({
                    runState: data.runState
                });
            });
        } else if( request.action === 'getSelector' ){
            getSelector( request, sender, sendResponse );
        } else if(request.action === 'searchForTerm'){
            var termStatus = 'term not found';
            console.log('received term: ', request.term);
            console.log('currentTerms: ', currentTerms);
            if(typeof currentTerms !== 'undefined'){
                console.log('currentTerms is defined');
                for(var i = 0; i < currentTerms.length; i++ ){
                    if(currentTerms[i].hasOwnProperty( request.term )){
                        if( doLog ){
                            console.log('term is found', request);
                        }
                        termStatus = 'term was found';

                        showWindows( request , i );
                        break;
                    }
                }
                sendResponse({
                    status: termStatus
                });
            }
        } else if(request.action === 'updateTabURL'){
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                var tabURL = tabs[0].url;
                console.log(tabURL);
                parseInputField = request.parseInputField;
                var newURL = currentURL + request.term;
                console.log('new url: ', newURL);
                chrome.tabs.update(tabs[0].id, {url: newURL});
                if( doLog ){
                    console.log('tabURL: ', tabs[0].url );
                }
            });
        }

        //From popup
        else if( request.action === 'changeRunState' ){

            if( doLog ){
                console.log( 'ChangeRunState from popup / current value is: ', currentState );
            }

            if( currentState === 'enabled'){
                currentState = 'disabled';
            } else {
                currentState = 'enabled';
            }

            chrome.storage.sync.set({ runState: currentState },
                function () {
                    if( doLog ){
                        console.log( 'Saved', 'runState', currentState );
                    }

                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, function( tabs ) {
                        chrome.tabs.sendMessage( tabs[0].id, {
                            action: 'changeRunState',
                            runState: currentState
                        }, function( response ) {
                            if( response ){
                                if( doLog ){
                                    console.log( response.message );
                                }
                            } else {
                                if( doLog ){
                                    console.log('Content script not injected');
                                }
                            }
                        });
                    });

                    sendResponse({
                        runState: currentState
                    });
                }
            );
        } else if( request.action === 'getRunState' ){
            sendResponse({
                runState: currentState
            });
        } else {
            if( doLog ){
                console.log( 'Message to event page was not handled: ', request );
            }
        }

        return true;
    }
);
