(function(){
    var englishTerms;

    function getSelectList(){
        //Create and append select list
        var terms = Object.keys( englishTerms );

        var selectList = document.createElement("SELECT");
        selectList.className = 're-search-select';
        selectList.id = "termList";

        var defaultOption = document.createElement("option");
        defaultOption.value = 'Try Re-search';
        defaultOption.text = 'Try Re-search';
        selectList.add(defaultOption);

        terms.sort(function (a, b) {
            return a.localeCompare(b);
        });

        //Create and append the options
        for (var i = 0; i < terms.length; i++) {
            var option = document.createElement("option");
            option.value = terms[i];
            option.text = terms[i];
            selectList.add(option);
        }

        return selectList;
    }

    function getToolbar(){
        var toolbar = document.createElement( 'div' );
        toolbar.className = 're-search-toolbar';
        toolbar.id = 're-search-toolbar';

        var logoWrapper = document.createElement( 'div' );
        logoWrapper.className = 're-search-logo-wrapper';

        var logo = document.createElement( 'img' );
        logo.setAttribute( 'src', chrome.extension.getURL( 'icon-white.png' ) );

        logoWrapper.appendChild( logo );

        toolbar.appendChild( logoWrapper );

        var selectList = getSelectList();
        toolbar.appendChild( selectList );

        var tipButton = document.createElement( 'button' );
        tipButton.className = 're-search-tip-button';
        tipButton.innerText = 'Add to Re-Search';

        toolbar.appendChild( tipButton );

        var hideButton = document.createElement( 'a' );
        hideButton.className = 're-search-hide-button';
        hideButton.innerText = 'X';

        toolbar.appendChild( hideButton );

        var onOffToggle = document.createElement( 'div' );
        onOffToggle.className = 're-search-on-off-toggle';

        var onOffPaddle = document.createElement( 'div' );
        onOffPaddle.className = 're-search-on-off-paddle';

        var onText = document.createElement( 'a' );
        onText.className = 're-search-on-off-text';
        onText.innerText = 'On';

        var offText = document.createElement( 'a' );
        offText.className = 're-search-on-off-text';
        offText.innerText = 'Off';

        onOffToggle.appendChild( onOffPaddle );
        onOffToggle.appendChild( onText );
        onOffToggle.appendChild( offText );

        toolbar.appendChild( onOffToggle );

        var readMoreButton = document.createElement( 'a' );
        readMoreButton.className = 're-search-read-more-button';
        readMoreButton.innerText = 'Read more';
        readMoreButton.href = 'http://semcon.com';

        toolbar.appendChild( readMoreButton );

        var shareButton = document.createElement( 'a' );
        shareButton.className = 're-search-share-button';
        shareButton.innerText = 'Share';
        shareButton.href = '#';

        toolbar.appendChild( shareButton );

        return toolbar;
    }

    function setDisabledState(){
        document.querySelector( '.re-search-on-off-toggle' ).classList.remove( 'active' );
        document.querySelector( '.re-search-select' ).setAttribute( 'disabled', 'disabled' );
        document.querySelector( '.re-search-tip-button' ).setAttribute( 'disabled', 'disabled' );
    }

    function setEnabledState(){
        document.querySelector( '.re-search-on-off-toggle' ).classList.add( 'active' );
        document.querySelector( '.re-search-select' ).removeAttribute( 'disabled' );
        document.querySelector( '.re-search-tip-button' ).removeAttribute( 'disabled' );
    }

    function addListeners(){
        window.addEventListener( 'click', function( event ){
            if( event.target.className === 're-search-on-off-text' ){
                if( document.querySelector( '.re-search-on-off-toggle' ).classList.contains( 'active' ) ){
                    chrome.runtime.sendMessage({
                        action: 'disablePopups'
                    });
                } else {
                    chrome.runtime.sendMessage({
                        action: 'enablePopups'
                    });
                }
            }
        });

        window.addEventListener( 'change', function(event){
            if( event.target.id === 'termList' ){
                console.log('in get element from drop down');
                var term = document.getElementById( 'termList' ).value;

                chrome.runtime.sendMessage({
                    action: 'updateTabURL',
                    term: term
                });
            }
        });

        window.addEventListener( 'click', function( event ){
            if( event.target.className === 're-search-hide-button' ){
                chrome.runtime.sendMessage({
        			action: 'disableToolbar'
        		});
            }
        });

        chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ) {
            if( request.runState ){
                setEnabledState();
            } else {
                setDisabledState();
            }
        });
    }

    function injectToolbar(){
        if( document.getElementById( 're-search-toolbar' ) ){
            return false;
        }

        var toolbar = getToolbar();
        var body = document.querySelectorAll( 'body' )[ 0 ];
        var currentStyle;
        var newStyle;

        for( var i = 0; i < body.children.length; i = i + 1 ){
            currentStyle = body.children[ i ].getAttribute( 'style' );

            if( !currentStyle ){
                newStyle = 'transform: translateY( 60px );';
            } else {
                newStyle = currentStyle + '; transform: translateY( 60px );';
            }

            body.children[ i ].setAttribute( 'style', newStyle );
        }

        addListeners();
        body.insertBefore( toolbar, body.children[ 0 ] );

        chrome.runtime.sendMessage({
            action: 'getRunState'
        }, function( response ) {
            if( request.runState ){
                setEnabledState();
            } else {
                setDisabledState();
            }
        });
    }

    function removeToolbar(){
        var body = document.querySelectorAll( 'body' )[ 0 ];
        var toolbar = document.getElementById( 're-search-toolbar' );

        for( var i = 0; i < body.children.length; i = i + 1 ){
            currentStyle = body.children[ i ].getAttribute( 'style' );

            if( !currentStyle ){
                newStyle = 'transform: translateY( 0px );';
            } else {
                newStyle = currentStyle + '; transform: translateY( 0px );';
            }

            body.children[ i ].setAttribute( 'style', newStyle );
        }

        if( toolbar ){
            toolbar.remove();
        }
    }

    chrome.runtime.sendMessage({
        action: 'getToolbarStatus'
    }, function( response ){
        if( response.showBar ){
            chrome.runtime.sendMessage({
                action: 'getEnglishTerms'
            }, function( response ) {
                englishTerms = response.englishTerms;
                injectToolbar();
            });
        } else {
            removeToolbar();
        }
    });
})()
