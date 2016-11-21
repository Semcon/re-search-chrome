// Author: Sara Amani, Oskar Risberg, Basim Ali
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

        if( !term ){
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
            sendTerm( getSearchTerm() );
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
            return element.value;
        }

        return false;
    }

    function init(){
        if( document.readyState !== 'complete' ){
            setTimeout( init, 100 );
            return false;
        }

        titleTerm = document.getElementsByTagName( 'title' )[ 0 ].textContent;
        addListeners();
        sendTerm( getSearchTerm() );
    }

    chrome.runtime.sendMessage({
        action: 'getEngineInformation'
    }, function( response ) {
        if( response.selectorSearchField !== false ){
            inputSelector = response.selectorSearchField;

            init();
        }
    });

    chrome.runtime.onMessage.addListener( function( request, sender, response ){
        console.log( 'got messagwe' );
        if( request.action === 'getTerm' ){
            response( getSearchTerm() );
        }
    });
})();
