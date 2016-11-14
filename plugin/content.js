(function(){
    var elements;
    var inputSelector;
    var titleTerm = false;
    var listenersAdded = false;

    function sendText( text ){
        if( typeof text === 'undefined' ){
            return false;
        }


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
            getSearchTerm();
        });

        listenersAdded = true;
    }

    //Gets search terms when different events occur.
    function getSearchTerm(){
        elements = document.querySelectorAll(inputSelector);
        if( elements.length === 0 ){
            setTimeout( getSearchTerm, 100 );

            return false;
        }

        var element = elements[ 0 ];
        if( element.value.length > 0 ){
            sendTerm( element.value );
        }
    }

    function init(){
        if( document.readyState !== 'complete' ){
            setTimeout( init, 100 );
            return false;
        }

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
        }
    });
})();
