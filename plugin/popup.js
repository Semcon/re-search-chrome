(function(){
    function enableToolbar(){
        chrome.runtime.sendMessage({
            action: 'enableToolbar'
        });

        document.querySelector( '.re-search-yes-no-toggle' ).classList.add( 'enabled' );
    }

    function disableToolbar(){
        chrome.runtime.sendMessage({
            action: 'disableToolbar'
        });

        document.querySelector( '.re-search-yes-no-toggle' ).classList.remove( 'enabled' );
    }

    window.addEventListener( 'click', function( event ){
        if( event.target.classList.contains( 're-search-yes-no-text' ) || event.target.classList.contains( 're-search-yes-no-paddle' ) ){
            if( document.querySelector( '.re-search-yes-no-toggle' ).classList.contains( 'enabled' ) ){
                disableToolbar();
            } else {
                enableToolbar();
            }
        }
    } );

    chrome.runtime.sendMessage({
        action: 'getToolbarStatus'
    }, function( response ){
        if( response.showBar ){
            document.querySelector( '.re-search-yes-no-toggle' ).classList.add( 'enabled' );
        }
    });

    chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ){
        switch( request.action ){
            case 'enableToolbar':
                document.querySelector( '.re-search-yes-no-toggle' ).classList.add( 'enabled' );

                break;
            case 'disableToolbar':
                document.querySelector( '.re-search-yes-no-toggle' ).classList.remove( 'enabled' );

                break;
        }
    });
})();
