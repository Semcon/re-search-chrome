(function(){
    var tipUrl = 'http://example.com';

    function getSelectList( englishTerms ){
        //Create and append select list
        var terms = Object.keys( englishTerms );

        var selectList = document.createElement( 'select');
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
        for (var i = 0; i < terms.length; i = i + 1 ) {
            var option = document.createElement("option");
            option.value = terms[i];
            option.text = terms[i];
            selectList.add(option);
        }

        return selectList;
    }

    function getShare(){
        var shareWrapper = document.createElement( 'div' );
        shareWrapper.className = 're-search-share-wrapper';

        var shareButton = document.createElement( 'a' );
        shareButton.className = 're-search-share-button';
        shareButton.innerText = 'Share';

        shareWrapper.appendChild( shareButton );

        var shareLinkedin = document.createElement( 'a' );
        shareLinkedin.setAttribute( 'href', 'https://www.linkedin.com/shareArticle?url=http://example.com&title=Example' );
        shareLinkedin.className = 're-search-share-linkedin re-search-hidden';
        shareLinkedin.setAttribute( 'target', '_BLANK' );

        var shareLinkedinImage = document.createElement( 'img' );
        shareLinkedinImage.setAttribute( 'src', chrome.extension.getURL( 'icons/icon-linkedin-square.png' ) );
        shareLinkedinImage.className = 're-search-share-icon';

        shareLinkedin.appendChild( shareLinkedinImage );

        shareWrapper.appendChild( shareLinkedin );

        var shareFacebook = document.createElement( 'a' );
        shareFacebook.setAttribute( 'href', 'https://www.facebook.com/sharer.php?u=http://example.com' );
        shareFacebook.className = 're-search-share-facebook re-search-hidden';
        shareFacebook.setAttribute( 'target', '_BLANK' );

        var shareFacebookImage = document.createElement( 'img' );
        shareFacebookImage.setAttribute( 'src', chrome.extension.getURL( 'icons/icon-facebook-square.png' ) );
        shareFacebookImage.className = 're-search-share-icon';

        shareFacebook.appendChild( shareFacebookImage );

        shareWrapper.appendChild( shareFacebook );

        var shareTwitter = document.createElement( 'a' );
        shareTwitter.setAttribute( 'href', ' https://twitter.com/intent/tweet?url=http://example.com&text=Example' );
        shareTwitter.className = 're-search-share-twitter re-search-hidden';
        shareTwitter.setAttribute( 'target', '_BLANK' );

        var shareTwitterImage = document.createElement( 'img' );
        shareTwitterImage.setAttribute( 'src', chrome.extension.getURL( 'icons/icon-twitter-square.png' ) );
        shareTwitterImage.className = 're-search-share-icon';

        shareTwitter.appendChild( shareTwitterImage );

        shareWrapper.appendChild( shareTwitter );

        return shareWrapper;
    }

    function getToolbar(){
        var toolbar = document.createElement( 'div' );
        toolbar.className = 're-search-toolbar';
        toolbar.id = 're-search-toolbar';

        var logoWrapper = document.createElement( 'div' );
        logoWrapper.className = 're-search-logo-wrapper';

        var logo = document.createElement( 'img' );
        logo.setAttribute( 'src', chrome.extension.getURL( 'icons/icon-white.png' ) );

        logoWrapper.appendChild( logo );

        toolbar.appendChild( logoWrapper );

        var tipButton = document.createElement( 'button' );
        tipButton.className = 're-search-button re-search-tip-button';
        tipButton.innerText = 'Add to Re-Search';

        toolbar.appendChild( tipButton );

        chrome.runtime.sendMessage({
            action: 'getEnglishTerms'
        }, function( response ) {
            var selectList = getSelectList( response.englishTerms );
            toolbar.insertBefore( selectList, tipButton );
        });

        var approvedTipText = document.createElement( 'div' );
        approvedTipText.className = 're-search-approved-tip-text re-search-hidden';
        approvedTipText.innerText = 'Thumbs up! We\'ll look into that.';

        toolbar.appendChild( approvedTipText );

        var tipText = document.createElement( 'div' );
        tipText.className = 're-search-tip-text re-search-hidden';
        tipText.innerText = 'Do you want to add ';

        var tipTerm = document.createElement( 'span' );
        tipTerm.className = 're-search-tip-term';

        tipText.appendChild( tipTerm );

        toolbar.appendChild( tipText );

        var approveTipButton = document.createElement( 'button' );
        approveTipButton.className = 're-search-button re-search-approve-tip-button re-search-hidden';
        approveTipButton.innerText = 'Yes';

        toolbar.appendChild( approveTipButton );

        var denyTipButton = document.createElement( 'button' );
        denyTipButton.className = 're-search-button re-search-deny-tip-button re-search-hidden';
        denyTipButton.innerText = 'No';

        toolbar.appendChild( denyTipButton );

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

        toolbar.appendChild( getShare() );

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

    function approveTip(){
        document.querySelector( '.re-search-tip-text' ).classList.add( 're-search-hidden' );
        document.querySelector( '.re-search-approve-tip-button' ).classList.add( 're-search-hidden' );
        document.querySelector( '.re-search-deny-tip-button' ).classList.add( 're-search-hidden' );

        document.querySelector( '.re-search-approved-tip-text' ).classList.remove( 're-search-hidden' );

        chrome.runtime.sendMessage({
            action: 'sendTip'
        });
    }

    function showShareButtons(){
        document.querySelector( '.re-search-share-button' ).classList.add( 're-search-hidden' );

        document.querySelector( '.re-search-share-twitter' ).classList.remove( 're-search-hidden' );
        document.querySelector( '.re-search-share-facebook' ).classList.remove( 're-search-hidden' );
        document.querySelector( '.re-search-share-linkedin' ).classList.remove( 're-search-hidden' );
    }

    function hideTip(){
        document.querySelector( '.re-search-tip-button' ).classList.remove( 're-search-hidden' );

        document.querySelector( '.re-search-tip-text' ).classList.add( 're-search-hidden' );
        document.querySelector( '.re-search-approve-tip-button' ).classList.add( 're-search-hidden' );
        document.querySelector( '.re-search-deny-tip-button' ).classList.add( 're-search-hidden' );
    }

    function showTip(){
        document.querySelector( '.re-search-tip-button' ).classList.add( 're-search-hidden' );
        chrome.runtime.sendMessage({
            action: 'getLatestTerm'
        }, function( response ){
            document.querySelector( '.re-search-tip-text' ).classList.remove( 're-search-hidden' );
            document.querySelector( '.re-search-approve-tip-button' ).classList.remove( 're-search-hidden' );
            document.querySelector( '.re-search-deny-tip-button' ).classList.remove( 're-search-hidden' );

            document.querySelector( '.re-search-tip-term' ).innerText = response.latestTerm;
        });
    }

    function addListeners(){
        window.addEventListener( 'click', function( event ){
            if( event.target.classList.contains( 're-search-on-off-text' ) ){
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
            if( event.target.classList.contains( 're-search-hide-button' ) ){
                chrome.runtime.sendMessage({
        			action: 'disableToolbar'
        		});
            }
        });

        window.addEventListener( 'click', function( event ){
            if( event.target.classList.contains( 're-search-tip-button' ) ){
                showTip();
            }
        });

        window.addEventListener( 'click', function( event ){
            if( event.target.classList.contains( 're-search-deny-tip-button' ) ){
                hideTip();
            }
        });

        window.addEventListener( 'click', function( event ){
            if( event.target.classList.contains( 're-search-approve-tip-button' ) ){
                approveTip();
            }
        });

        window.addEventListener( 'click', function( event ){
            if( event.target.classList.contains( 're-search-share-button' ) ){
                event.preventDefault();
                showShareButtons();
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
            if( response && response.runState ){
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
                action: 'isValidUrl'
            }, function( response ){
                if( response.valid ){
                    injectToolbar();
                }
            });
        } else {
            removeToolbar();
        }
    });
})()
