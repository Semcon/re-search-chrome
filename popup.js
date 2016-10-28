(function(){

    function switchState( element ){
        if( element.classList.contains( 'switchbtn-on' ) ) {
            element.classList.remove( 'switchbtn-on' );
            element.classList.add( 'switchbtn-off' );
        } else {
            element.classList.remove( 'switchbtn-off' );
            element.classList.add( 'switchbtn-on' );
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        console.log('domContentLoaded');

        document.querySelectorAll( '.js-power-button' )[ 0 ].addEventListener("click", function( event ){
            chrome.runtime.sendMessage({
                action: "changeRunState"
            }, function(response) {
                switchState( document.querySelectorAll( '.js-power-button' )[ 0 ] );
            });
        });

        chrome.runtime.sendMessage({
            action: "getRunState"
        }, function(response) {
            console.log("Run state is: " , response.runState);
            var enabledButtons = document.querySelectorAll( '.switchbtn-on' );

            if( response.runState === 'disabled' && enabledButtons.length > -1 ){
                switchState( enabledButtons[ 0 ] );
            }
        });
    });
})();
