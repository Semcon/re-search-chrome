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


function showWindows(request){
    if( typeof currentURL !== 'undefined' && typeof currentTerms !== 'undefined' ){
        var link = currentURL + currentTerms[request];

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

                var engineTerms = jsonData.engines[i].terms;
                var englishTerms = jsonData.terms[engineTerms].eng;
                var currentLanguage = jsonData.engines[i].language;
                currentTerms = jsonData.terms[engineTerms][currentLanguage];
                currentURL = jsonData.engines[i].url;
                var selectorInput = jsonData.engines[i].selectors.input;
                var selectorBtn;
                var selectorAutoCmpl;

                if( jsonData.engines[i].selectors.hasOwnProperty('button') ){
                    selectorBtn = jsonData.engines[i].selectors.button;
                }

                if( jsonData.engines[i].selectors.hasOwnProperty('autocomplete') ){
                    selectorAutoCmpl = jsonData.engines[i].selectors.autocomplete;
                }

                sendResponse({
                    selectorSearchField: selectorInput,
                    selectorButton: selectorBtn,
                    selectorAutoComplete: selectorAutoCmpl,
                    terms: englishTerms
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
        //content script asks if extension is on/off
        if( request.runState === '?' ){
            chrome.storage.sync.get( 'runState', function(data) {
                sendResponse({
                    runState: data.runState
                });
            });
        } else if( request.selector === 'selector' ){
            getSelector( request, sender, sendResponse );
        } else if( typeof currentTerms !== 'undefined' && currentTerms.hasOwnProperty( request )){
            //content script is sending terms
            if( doLog ){
                console.log('term is found', request);
            }

            sendResponse({
                status: 'term was found'
            });

            showWindows( request );
        } else if( request.runState === 'changeState' ){
            //From popup
            if( doLog ){
                console.log( 'ChangeState from popup / current value is: ', currentState );
            }

            if( currentState === 'enabled'){
                currentState = 'disabled';
            } else {
                currentState = 'enabled';
            }

            chrome.storage.sync.set(
                {
                    runState: currentState
                },
                function () {
                    if( doLog ){
                        console.log( 'Saved', 'runState', currentState );
                    }

                    chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    }, function( tabs ) {
                        chrome.tabs.sendMessage( tabs[0].id, {
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
        } else if( request.runState === 'getState' ){
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
