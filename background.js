var currentState = '';
var currentTerms;
var currentURL;
var jsonData;
var doLog = false;
var alternateWindow = false;
var originWindow = false;

var DATA_URL = 'https://api.myjson.com/bins/1rq4a';

//First time running script to check what value runState is in chrome storage.
//If runState is undefined it is gets set to enabled otherwise it gets the value.
chrome.storage.sync.get( 'runState', function(data) {
    currentState = data.runState;

    if( doLog ){
        console.log( 'val: ', currentState );
    }

    if( typeof currentState === 'undefined' ){
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
    if( doLog ){
        console.log( 'Window removed', windowId );
    }

    if( windowId === alternateWindow.id ){
        chrome.windows.update( originWindow.id, {
            left: originWindow.left,
            top: originWindow.top,
            width: originWindow.width,
            height: originWindow.height,
            focused: originWindow.focused
        } );

        alternateWindow = false;
    } else if ( windowId = originWindow.id && alternateWindow.id ){
        chrome.windows.update( alternateWindow.id, {
            left: originWindow.left,
            top: originWindow.top,
            width: originWindow.width,
            height: originWindow.height,
            focused: originWindow.focused
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

function showWindows( request, newTerm, windowOriginId ){

    if( doLog ){
        console.log( request.term );
    }

    if( typeof currentURL !== 'undefined' ){
        var link = currentURL + newTerm;
        var originLink = currentURL + request.term;

        if( doLog ){
            console.log( 'Link: ' , link );
        }

        if( alternateWindow === false ){
            chrome.windows.getCurrent( {}, function( window ){
                if( doLog ){
                    console.log( window );
                }

                originWindow = window;

                chrome.windows.create( {
                    height: parseInt( window.height, 10 ),
                    left: parseInt( window.left + ( window.width / 2 ), 10 ),
                    state: 'normal',
                    top: parseInt( window.top, 10 ) ,
                    type: 'normal',
                    url: link,
                    width: parseInt( window.width / 2, 10 )
                }, function( createdWindowData ) {
                    alternateWindow = createdWindowData;
                });

                chrome.windows.update( window.id, {
                    left: parseInt( window.left, 10 ),
                    state: 'normal',
                    top: parseInt( window.top, 10 ),
                    width: parseInt( window.width / 2, 10 )
                });
            });
        } else {
            if( doLog ){
                console.log( 'Should update alternate window' );
            }

            if( windowOriginId === alternateWindow.id ){
                chrome.tabs.query( {
                    active: true,
                    windowId: originWindow.id
                }, function( tabs ) {
                    chrome.tabs.update( tabs[0].id, {
                        url: originLink
                    });
                });
            }

            chrome.tabs.update( alternateWindow.tabs[ 0 ].id, {
                url: link
            });
        }
    } else {
        if( doLog ){
            console.log( 'currentURL and/or currentTerms is undefined' );
        }
    }
}

function getEngineInformation( request, sender, sendResponse ){
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
                    currentTerms.push( jsonData.terms[ currentEngine.terms ][ key ] );
                }

                currentURL = currentEngine.url;

                sendResponse({
                    selectorSearchField: currentEngine.selectors.input,
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
        var queryOptions = {};

        switch(request.action){

            case 'getEngineInformation':
                getEngineInformation( request, sender, sendResponse );
                break;

            case 'searchForTerm':
                var termStatus = 'term not found';
                var lowercaseTerms;

                if( doLog ){
                    console.log('received term: ', request.term);
                    console.log('currentTerms: ', currentTerms);
                    console.log( 'Using term: ', request.term.toLowerCase() );
                }

                request.term = request.term.toLowerCase();

                if(typeof currentTerms !== 'undefined'){
                    if( doLog ){
                        console.log('currentTerms is defined');
                    }

                    for(var i = 0; i < currentTerms.length; i++ ){
                        console.log( currentTerms[ i ] );
                        lowercaseTerms = Object.keys( currentTerms[ i ] ).map( function( string ){
                            return string.toLowerCase();
                        });

                        if( lowercaseTerms.indexOf( request.term ) > -1 ){
                            if( doLog ){
                                console.log('term is found', request);
                            }

                            termStatus = 'term was found';

                            showWindows( request, currentTerms[ i ][ Object.keys( currentTerms[ i ] )[ lowercaseTerms.indexOf( request.term ) ] ], sender.tab.windowId );

                            break;
                        }
                    }

                    sendResponse({
                        status: termStatus
                    });
                }
                break;

            case 'updateTabURL':
                queryOptions.active = true;

                if( alternateWindow !== false ){
                    queryOptions.windowId = originWindow.id
                } else {
                    queryOptions.currentWindow = true;
                }

                if( typeof currentURL !== 'undefined' ){
                    chrome.tabs.query( queryOptions, function(tabs) {
                         var newURL = currentURL + request.term;
                         chrome.tabs.update( tabs[0].id, {
                             url: newURL
                         });
                    });
                }
                break;

            case 'getRunState':
                sendResponse({
                    runState: currentState
                });
                break;

            case 'changeRunState':
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
                break;

            default:
                if( doLog ){
                    console.log( 'Message to event page was not handled: ', request );
                }
        }

        return true;
    }
);
