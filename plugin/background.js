var currentState = '';
var showBar = '';

var currentTerms;
var currentURL;
var jsonData;
var doLog = false;
var alternateWindow = false;
var alternateTabId = false;
var originWindow = false;
var originTabId = false;

var DATA_URL = 'https://api.myjson.com/bins/1rq4a';

//First time running script to check what value runState is in chrome storage.
//If runState is undefined it is gets set to enabled otherwise it gets the value.
chrome.storage.sync.get( [ 'runState', 'showBar' ], function(data) {
    console.log( data );
    currentState = data.runState;
    showBar = data.showBar;

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

    if( typeof showBar === 'undefined' ){
        showBar = true;
        chrome.storage.sync.set( {
            showBar: showBar
        }, function () {
            if( doLog ){
                console.log( 'Saved', 'showBar', showBar );
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
    } else if ( windowId === originWindow.id && alternateWindow.id ){
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

chrome.tabs.onRemoved.addListener( function( tabId ){
    if( tabId === originTabId ){
        originTabId = false;
    }

    if( tabId === alternateTabId){
        alternateTabId = false;
    }
});

var xhr = new XMLHttpRequest();
xhr.open( 'GET', DATA_URL, true );
xhr.onreadystatechange = function() {
    if ( xhr.readyState === 4 && xhr.status === 200 ) {
        jsonData = JSON.parse( xhr.responseText );
    }
}
xhr.send();

function showWindows( term, newTerm, windowOriginId ){

    if( doLog ){
        console.log( term );
    }

    if( typeof currentURL !== 'undefined' ){
        var link = currentURL + newTerm;
        var originLink = currentURL + term;

        if( doLog ){
            console.log( 'Link: ' , link );
        }

        if( alternateWindow === false ){
            chrome.windows.getCurrent( {}, function( window ){
                if( doLog ){
                    console.log( window );
                }

                originWindow = window;

                chrome.tabs.query( {
                    active: true,
                    windowId: originWindow.id
                }, function(tabs) {
                    if( doLog ){
                        console.log('origin tab ID: ' , tabs[0].id);
                    }

                    originTabId = tabs[0].id;
                });

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

                    chrome.tabs.query( {
                        active: true,
                        windowId: alternateWindow.id
                    }, function(tabs) {

                        if( doLog ){
                            console.log('alternate tab ID: ' , tabs[0].id);
                        }

                        alternateTabId = tabs[0].id;
                    });
                });

                chrome.windows.update( window.id, {
                    left: parseInt( window.left, 10 ),
                    top: parseInt( window.top, 10 ),
                    width: parseInt( window.width / 2, 10 )
                });
            });
        } else {
            if( doLog ){
                console.log( 'Should update alternate window' );
            }

            if( windowOriginId === alternateWindow.id ){
                if( originTabId ){
                    chrome.tabs.update( originTabId, {
                        active: true,
                        url: originLink
                    });
                } else {
                    chrome.tabs.create( {
                        active: true,
                        url: originLink,
                        windowId: originWindow.id
                    }, function (tab) {

                        if( doLog ){
                            console.log('origin tab ID: ', tab.id);
                        }

                        originTabId = tab.id;

                    } );
                }
            }

            if( alternateTabId === false ){
                chrome.tabs.create( {
                    active: true,
                    url: link,
                    windowId: alternateWindow.id
                }, function (tab){

                    if( doLog ){
                        console.log('alternate tab ID: ', tab.id);
                    }

                    alternateTabId = tab.id;

                } );
            }

            else{
                chrome.tabs.update( alternateTabId, {
                    url: link,
                    active: true
                });
            }
        }
    } else {
        if( doLog ){
            console.log( 'currentURL and/or currentTerms is undefined' );
        }
    }
}

function showToolbar(){
    if( !showBar && !currentURL ){
        return false;
    }

    console.log( originTabId, alternateTabId );

    if( originTabId ){
        chrome.tabs.insertCSS( originTabId, {
            file: '/toolbar/toolbar.css'
        }, function(){
            chrome.tabs.executeScript( originTabId, {
                file: '/toolbar/toolbar.js'
            });
        });
    }

    if( alternateTabId ){
        chrome.tabs.insertCSS( alternateTabId, {
            file: '/toolbar/toolbar.css'
        }, function(){
            chrome.tabs.executeScript( alternateTabId, {
                file: '/toolbar/toolbar.js'
            });
        });
    }
}

function hasBetterTerm( term ){
    var lowercaseTerms;

    if( typeof currentTerms === 'undefined' ){
        return false;
    }

    if( doLog ){
        console.log( 'received term: ', term );
        console.log( 'currentTerms: ', currentTerms );
        console.log( 'Using term: ', term.toLowerCase() );
    }

    term = term.toLowerCase();

    if( doLog ){
        console.log('currentTerms is defined');
    }

    for(var i = 0; i < currentTerms.length; i++ ){
        lowercaseTerms = Object.keys( currentTerms[ i ] ).map( function( string ){
            return string.toLowerCase();
        });

        if( lowercaseTerms.indexOf( term ) > -1 ){
            if( doLog ){
                console.log( 'term is found', term );
            }

            return currentTerms[ i ][ Object.keys( currentTerms[ i ] )[ lowercaseTerms.indexOf( term ) ] ];
        }
    }

    return false;
}

function isValidEngine( url ){
    if( typeof jsonData === 'undefined' ) {
        return false;
    }

    if( typeof url === 'undefined' ){
        return false;
    }

    console.log( url );

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
            return jsonData.engines[ i ];
        }
    }

    return false;
}

function getEngineInformation( request, sender, sendResponse ){
    var currentEngine = isValidEngine( request.url );

    console.log( currentEngine );

    // Loop over all engines
    if( !currentEngine ){
        if( doLog ){
            console.log( 'If not valid site, Url:', request.url );
        }

        sendResponse({
            selectorSearchField: false
        });

        return false;
    }

    if( doLog ){
        console.log( 'Valid site' );
    }

    currentTerms = [];
    for ( var key in jsonData.terms[ currentEngine.terms ] ){
        currentTerms.push( jsonData.terms[ currentEngine.terms ][ key ] );
    }

    currentURL = currentEngine.url;
    englishTerms = jsonData.terms[ currentEngine.terms ].eng;

    showToolbar();

    sendResponse({
        selectorSearchField: currentEngine.selectors.input
    });

    return true;
}

chrome.runtime.onMessage.addListener(
    function( request, sender, sendResponse ) {
        var queryOptions = {};
        var betterTerm = false;

        switch( request.action ){
            case 'getEngineInformation':
                getEngineInformation( request, sender, sendResponse );

                break;
            case 'getEnglishTerms':
                sendResponse({
                    englishTerms: englishTerms
                });

                break;
            case 'searchForTerm':
                betterTerm = hasBetterTerm( request.term );
                if( betterTerm ){
                    showWindows( request.term, betterTerm, sender.tab.windowId );
                };

                break;
            case 'updateTabURL':
                queryOptions.active = true;

                if( alternateWindow !== false ){
                    queryOptions.windowId = originWindow.id
                }

                if( typeof currentURL !== 'undefined' ){
                    var newURL = currentURL + request.term;
                    if( originTabId ){
                        chrome.tabs.update( originTabId, {
                            active: true,
                            url: newURL
                        });
                    } else if( alternateWindow === false ){
                        chrome.tabs.update( sender.tab.id, {
                            active: true,
                            url: newURL
                        });
                    } else {
                        queryOptions.url = newURL;
                        chrome.tabs.create(
                            queryOptions,
                            function (tab){

                                if( doLog ){
                                    console.log('origin tab ID: ', tab.id);
                                }

                                originTabId = tab.id;

                        } );
                    }
                }

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
            case 'addToolbar':
                showToolbar();

                break;
            case 'enableToolbar':
                showBar = true;

                chrome.storage.sync.set({ showBar: showBar },
                    function () {
                        if( doLog ){
                            console.log( 'Saved', 'showBar', showBar );
                        }

                        showToolbar();
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
