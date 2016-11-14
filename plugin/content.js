(function(){
    var elements;
    var inputSelector;
    var titleTerm = false;
    var listenersAdded = false;

    function sendText( text ){
        if( typeof text === 'undefined' ){
            return false;
        }

        console.log( 'Sending', text );

        chrome.runtime.sendMessage({
            action: "searchForTerm",
            term: text
        });
    }

    function getTitle(){
        // Why textContent?
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
        if( listenersAdded ){
            return false;
        }

        setInterval( getTitle, 64 );

        window.addEventListener( 'term', function(){
            console.log('in eventlistener set ui');
            getSearchTerm();
        });

        listenersAdded = true;
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
        if( document.readyState !== 'complete' ){
            setTimeout( init, 100 );
            return false;
        }

        console.log( 'document is complete');

        titleTerm = document.getElementsByTagName( 'title' )[ 0 ].innerText;
        addListeners();
        getSearchTerm();
    }

    chrome.runtime.sendMessage({
        action: 'getEngineInformation',
        url: window.location.href
    }, function( response ) {
        if( response.selectorSearchField !== false ){
            inputSelector = response.selectorSearchField;

            init();
        } else {
            console.log('Selector not found');
        }
    });
})();
