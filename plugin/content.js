(function(){
    var runState;
    var runInit = true;
    var elements;
    var runSetUI = true;
    var inputSelector;
    var titleTerm = false;
    var englishTerms;


    function sendText( text ){
        if( runState === 'enabled' && typeof text !== 'undefined' ){
            console.log( 'Sending', text );
            chrome.runtime.sendMessage({
                action: "searchForTerm",
                term: text
            }, function(response) {
                if( response ){
                    console.log(response.status);
                }
            });
        }
    }

    function getTitle(){
        // http://perfectionkills.com/the-poor-misunderstood-innerText/
        var currentTitle = document.getElementsByTagName( 'title' )[ 0 ].textContent;
        var event;

        if( currentTitle !== titleTerm ){
            console.log( 'got new term from title' );
            event = new Event( 'term' );
            window.dispatchEvent( event );

            titleTerm = currentTitle;
        }
    }

    function addListeners(){
        setInterval( getTitle, 64 );

        window.addEventListener( 'term', function(){
            console.log('in eventlistener set ui');
            getSearchTerm();
        });

        window.addEventListener('change', function(event){
            if( event.target.id === 'termList' ){
                console.log('in get element from drop down');
                var term = document.getElementById( 'termList' ).value;

                chrome.runtime.sendMessage({
                    action: "updateTabURL",
                    term: term
                });
            }
        });
    }

    //Gets search terms when different events occur.
    function getSearchTerm(){
        console.log('SelectorInput: ', inputSelector);
        elements = document.querySelectorAll(inputSelector);
        if( elements.length === 0 ){
            setTimeout( getSearchTerm, 100 );
            console.log( inputSelector, '`s length was 0' );
            return false;
        }

        var element = elements[ 0 ];
        if( element.value.length > 0 ){
            console.log('if value is > 0');
            sendText( element.value );
        }
    }

    function init(){
        console.log('In init');
        chrome.runtime.sendMessage({
            action: 'getEngineInformation',
            url: window.location.href
        }, function(response) {
            if( response.selectorSearchField !== false ){
                inputSelector = response.selectorSearchField;

                if(runSetUI !== false){
                    englishTerms = response.englishTerms;

                    chrome.runtime.sendMessage({
                        action: 'addToolbar'
                    });

                    runSetUI = false;
                }

                titleTerm = document.getElementsByTagName( 'title' )[ 0 ].innerText;
                addListeners();
                getSearchTerm();
            } else {
                console.log('Selector not found');
            }
        });
    }

    function runWhenReady(){
        if( document.readyState !== 'complete' ){
            setTimeout( runWhenReady, 100 );
            return false;
        }

        console.log('document is complete');

        chrome.runtime.sendMessage({
            action: 'getRunState'
        }, function(response) {
            runState = response.runState;

            if(runState === 'enabled' && runInit === true){
                init();
                runInit = false;
            } else if( runState === 'disabled' ){
                console.log('runState DISABLED');
            }
        });
    }

    //first time content script runs
    runWhenReady();

    //Run state sent from background when user turns extension on/off
    chrome.runtime.onMessage.addListener(
        function( request, sender, sendResponse ) {
            if(request.action === 'changeRunState'){
                if ( request.runState === 'disabled' ){
                    runState = request.runState;

                    sendResponse({
                        message: 'received disabled'
                    });
                } else if( request.runState === 'enabled' ){
                    runState = request.runState;
                    if( document.readyState === 'complete' ){
                        console.log('document is complete');
                        if( runInit === true ){
                            init();
                            runInit = false;
                        }
                    }
                    sendResponse({
                        message: 'received enabled'
                    });
                }
            }
            else {
                console.log( 'Message from event page was not handled' );
            }

            return true;
        }
    );
})();
