var showBar = true;

var latestTerm = false;
var dropdownTerms = [];

var currentTerms;
var currentURL;
var jsonData;
var alternateWindow = false;
var alternateTabId = false;
var originWindow = false;
var originTabId = false;

var DATA_URL = 'https://api.myjson.com/bins/1bv2i';
var TIP_URL = 'http://example.com';

//First time running script to check what value showBar is in chrome storage.
//If showBar is undefined it is gets set to enabled otherwise it gets the value.
chrome.storage.sync.get( [ 'showBar' ], function(data) {
    showBar = data.showBar;

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

function sendTip(){
    var xhr = new XMLHttpRequest();
    xhr.open( 'POST', TIP_URL, true );
    xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
    xhr.onreadystatechange = function() {
        if ( xhr.readyState === 4 && xhr.status === 200 ) {
            console.log( 'Tip sent' );
        }
    }

    xhr.send( 'term=' + latestTerm );
}

function showWindows( term, newTerm, windowOriginId ){
    if( typeof currentURL === 'undefined' ){
        return false;
    }

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

function runToolbarScript(){
    if( !currentURL ){
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

    lowercaseTerms = Object.keys( currentTerms ).map( function( string ){
        return string.toLowerCase();
    });

    if( lowercaseTerms.indexOf( term ) > -1 ){
        return currentTerms[ Object.keys( currentTerms )[ lowercaseTerms.indexOf( term ) ] ];
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

function isValidUrl( url ){
    if( !getEngine( url ) ){
        return false;
    }

    return true;
}

function getEngineInformation( sender, sendResponse ){
    var currentEngine = getEngine( sender.url );

    if( !currentEngine ){
        sendResponse({
            selectorSearchField: false
        });

        return false;
    }

    currentTerms = {};
    dropdownTerms = [];
    for ( var key in jsonData.terms[ currentEngine.terms ] ){
        currentTerms[ key ] = jsonData.terms[ currentEngine.terms ][ key ].updated;

        if( jsonData.terms[ currentEngine.terms ][ key ].dropdown ){
            dropdownTerms.push( key );
        }
    }

    currentURL = currentEngine.url;

    runToolbarScript();

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
                getEngineInformation( sender, sendResponse );

                break;
            case 'getDropdownTerms':
                sendResponse({
                    dropdownTerms: dropdownTerms
                });

                break;
            case 'isValidUrl':
                if( isValidUrl( sender.url ) ){
                    sendResponse({
                        valid: true
                    });
                } else {
                    sendResponse({
                        valid: false
                    });
                }

                break;
            case 'searchForTerm':
                latestTerm = request.term;
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
            case 'getLatestTerm':
                sendResponse({
                    latestTerm: latestTerm
                });

                break;
            case 'sendTip':
                sendTip();

                break;
            case 'getToolbarStatus':
                sendResponse({
                    showBar: showBar
                });

                break;
            case 'enableToolbar':
                showBar = true;

                chrome.storage.sync.set({ showBar: showBar },
                    function () {
                        runToolbarScript();
                    }
                );

                break;
            case 'disableToolbar':
                showBar = false;

                chrome.storage.sync.set({ showBar: showBar },
                    function () {
                        runToolbarScript();
                    }
                );

                break;
            default:
                console.log( 'Message to event page was not handled: ', request );
        }

        return true;
    }
);
