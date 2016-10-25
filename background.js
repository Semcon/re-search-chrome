var currentState = '';
var currentTerms;
var currentURL;
var jsonData;
var doLog = false;

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


var xhr = new XMLHttpRequest();
xhr.open( 'GET', DATA_URL, true );
xhr.onreadystatechange = function() {
    if ( xhr.readyState === 4 && xhr.status === 200 ) {
        jsonData = JSON.parse( xhr.responseText );
    }
}
xhr.send();


function showWindows(request , index){
    console.log(currentTerms[index][request.term]);
    if( typeof currentURL !== 'undefined' && typeof currentTerms !== 'undefined' ){
        var link = currentURL + currentTerms[index][request.term];

        if( doLog ){
            console.log( 'Link: ' , link );
        }

        chrome.windows.getCurrent( {}, function( window ){
            if( doLog ){
                console.log( window );
            }

            chrome.windows.create( {
                height: window.height,
                left: window.width / 2 + 8,
                state: 'normal',
                top: 0,
                type: 'normal',
                url: link,
                width: window.width / 2 + 8
            });

            chrome.windows.update( window.id, {
                height: window.height,
                state: 'normal',
                width: window.width / 2 + 8
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

                //  var engine = jsonData.engines[i].terms;
                //  var englishTerms = jsonData.terms[engine].eng;
                //  var currentLanguage = jsonData.engines[i].language;
                //  var selectorInput = jsonData.engines[i].selectors.input;
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
            console.log('received term: ', request.term);
            if(typeof currentTerms !== 'undefined'){
                console.log('currentTerms not undefined');
                for(var i = 0; i < currentTerms.length; i++ ){
                    if(currentTerms[i].hasOwnProperty( request.term )){
                        if( doLog ){
                            console.log('term is found', request);
                        }

                        sendResponse({
                            status: 'term was found'
                        });

                        showWindows( request , i );
                    }
                }
            }

        //From popup
    } else if( request.action === 'changeRunState' ){

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
