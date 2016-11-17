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
})();
