(function(){
    var elements;
    var inputSelector;
    var titleTerm = false;
    var listenersAdded = false;
    var lastSentTerm = false;

    function sendTerm( term ){
        if( typeof term === 'undefined' ){
            return false;
        }

        if( lastSentTerm === term ){
            return false;
        }

        lastSentTerm = term;

        chrome.runtime.sendMessage({
            action: 'searchForTerm',
            term: term
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

        listenersAdded = true;

        setInterval( getTitle, 64 );

        window.addEventListener( 'term', function(){
            getSearchTerm();
        });
    }

    function getSearchTerm(){
        elements = document.querySelectorAll( inputSelector );
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

        titleTerm = document.getElementsByTagName( 'title' )[ 0 ].textContent;
        addListeners();
        getSearchTerm();
    }

    chrome.runtime.sendMessage({
        action: 'getEngineInformation'
    }, function( response ) {
        if( response.selectorSearchField !== false ){
            inputSelector = response.selectorSearchField;

            init();
        }
    });
})();
