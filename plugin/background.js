var currentState = '';
var showBar = '';

var currentTerms;
var currentURL;
var jsonData;
var alternateWindow = false;
var alternateTabId = false;
var originWindow = false;
var originTabId = false;

var DATA_URL = 'https://api.myjson.com/bins/1rq4a';

//First time running script to check what value runState is in chrome storage.
//If runState is undefined it is gets set to enabled otherwise it gets the value.
chrome.storage.sync.get( [ 'runState', 'showBar' ], function(data) {
    currentState = data.runState;
    showBar = data.showBar;

    if( typeof currentState === 'undefined' ){
        currentState = 'enabled';

        chrome.storage.sync.set({
            runState: currentState
        });
    }

    if( typeof showBar === 'undefined' ){
        showBar = true;
        chrome.storage.sync.set({
            showBar: showBar
        });
    }

    return true;
});

chrome.windows.onRemoved.addListener( function( windowId ){
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
    if( typeof currentURL !== 'undefined' ){
        var link = currentURL + newTerm;
        var originLink = currentURL + term;

        if( alternateWindow === false ){
            chrome.windows.getCurrent( {}, function( window ){
                originWindow = window;

                chrome.tabs.query( {
                    active: true,
                    windowId: originWindow.id
                }, function(tabs) {
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
                    alternateTabId = tab.id;

                } );
            } else {
                chrome.tabs.update( alternateTabId, {
                    url: link,
                    active: true
                });
            }
        }
    }
}

function showToolbar(){
    if( !showBar && !currentURL ){
        return false;
    }

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

    if( !originTabId && !alternateTabId ){
        chrome.tabs.insertCSS({
            file: '/toolbar/toolbar.css'
        }, function(){
            chrome.tabs.executeScript({
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

    term = term.toLowerCase();

    for(var i = 0; i < currentTerms.length; i++ ){
        lowercaseTerms = Object.keys( currentTerms[ i ] ).map( function( string ){
            return string.toLowerCase();
        });

        if( lowercaseTerms.indexOf( term ) > -1 ){
            return currentTerms[ i ][ Object.keys( currentTerms[ i ] )[ lowercaseTerms.indexOf( term ) ] ];
        }
    }

    return false;
}

function getEngine( url ){
    if( typeof jsonData === 'undefined' ) {
        return false;
    }

    if( typeof url === 'undefined' ){
        return false;
    }

    for( var i = 0; i < jsonData.engines.length; i = i + 1 ){
        var matchCount = 0;

        // Loop over all required matches for the engine
        for( var matchIndex = 0; matchIndex < jsonData.engines[ i ].match.length; matchIndex = matchIndex + 1 ){
            if( url.indexOf( jsonData.engines[ i ].match[ matchIndex ] ) > -1 ){
                // We have a match, increment our counter
                matchCount = matchCount + 1;
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
    var currentEngine = getEngine( request.url );

    if( !currentEngine ){
        sendResponse({
            selectorSearchField: false
        });

        return false;
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
                            function ( tab ) {
                                originTabId = tab.id;
                            }
                        );
                    }
                }

                break;
            case 'changeRunState':
                if( currentState === 'enabled'){
                    currentState = 'disabled';
                } else {
                    currentState = 'enabled';
                }

                chrome.storage.sync.set({ runState: currentState },
                    function () {

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

                        showToolbar();
                    }
                );

                break;
            default:
        }

        return true;
    }
);
