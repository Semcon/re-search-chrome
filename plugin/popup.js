// Author: Sara Amani, Oskar Risberg, Basim Ali, Gabriele Kasparaviciute
// Copyright (c) 2016, Semcon Sweden AB
// All rights reserved.

// Redistribution and use in source and binary forms, with or without modification, are permitted
// provided that the following conditions are met:
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,  this list of conditions and
//    the following disclaimer in the documentation and/or other materials provided with the distribution.
// 3. Neither the name of the Semcon Sweden AB nor the names of its contributors may be used to endorse or
//    promote products derived from this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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

    chrome.runtime.onMessage.addListener( function( request ){
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
