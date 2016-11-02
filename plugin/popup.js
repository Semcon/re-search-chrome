(function(){
    var jsonData = false;

    function switchState( element ){
        if( element.classList.contains( 'switchbtn-on' ) ) {
            element.classList.remove( 'switchbtn-on' );
            element.classList.add( 'switchbtn-off' );
        } else {
            element.classList.remove( 'switchbtn-off' );
            element.classList.add( 'switchbtn-on' );
        }
    }

    function setVersion(){
        if( !jsonData ){
            setTimeout( setVersion, 64 );
            return false;
        }

        document.querySelectorAll( '.js-disclaimer' )[ 0 ].innerText = jsonData.version;
    }

    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', 'manifest.json', true );
    xhr.onreadystatechange = function() {
        if ( xhr.readyState === 4 && xhr.status === 200 ) {
            jsonData = JSON.parse( xhr.responseText );
        }
    }
    xhr.send();

    document.addEventListener('DOMContentLoaded', function () {
        console.log('domContentLoaded');

        setVersion();

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
