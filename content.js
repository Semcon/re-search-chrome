(function(){
    var runState;
    var runInit = true;
    var elements;
    var runSetUI = true;

    function sendText( text ){
        console.log('in sendText');
        if( runState === 'enabled' && typeof text !== 'undefined' ){
            console.log( 'Sending', text );
            chrome.runtime.sendMessage( text, function(response) {
                if( response ){
                    console.log(response.status);
                }
            });
        }
    }

    function getSearchTerm(selectorInput, selectorButton, selectorAutoComplete){
        console.log('SelectorInput: ', selectorInput);
        elements = document.querySelectorAll(selectorInput);
        if( elements.length === 0 ){
            setTimeout( init, 100 );
            return false;
        }
        var element = elements[ 0 ];

        if( element.value.length > 0 ){
            console.log('if value is > 0');
            sendText( element.value );
        }

        //Gets value from search field if enter is pressed
        window.addEventListener( 'keydown', function( event ){
            if( event.keyCode === 13 ){
                console.log('enter was pressed');
                sendText(element.value);
            }
        });

        //Gets value autocomplete and checks parent and child elements
        if(typeof selectorAutoComplete !== 'undefined'){
          window.addEventListener('click', function (event) {
              if( String(event.target.classList).indexOf( selectorAutoComplete.replace( '.', '' ) ) > -1 ){
                  console.log('autocomplete was clicked');
                  sendText(event.target.outerText);
              } else if(String(event.target.parentElement.classList).indexOf( selectorAutoComplete.replace( '.', '' ) ) > -1 ){
                  console.log('autocomplete was clicked');
                  sendText(event.target.parentElement.outerText);
              } else if(event.target.children.length > 0){
                  for( var i = 0; i < event.target.children.length; i++ ){
                      if(event.target.children[i].children.length > 0){
                          for( var j = 0; j < event.target.children[i].children.length; j++ ){
                              if(String(event.target.children[i].children[j].className).indexOf( selectorAutoComplete.replace( '.', '' ) ) > -1){
                                  console.log('autocomplete was clicked');
                                  sendText( event.target.children[i].children[j].outerText );
                              }
                          }
                      }
                  }
              }
          });
        }

        //Gets value from searchField when search button is clicked
        if(typeof selectorButton !== 'undefined'){
          document.querySelectorAll(selectorButton)[0].addEventListener('click', function () {
              sendText(element.value);
          });
        }


        //Gets value from drop-down list
        if(document.getElementById('termList') !== null){
            document.getElementById('termList').addEventListener('change', function(event){
                sendText(document.getElementById('termList').value);
                document.querySelectorAll(selectorInput)[0].value = document.getElementById('termList').value;
                document.getElementById("termList").selectedIndex = 0;
            });
        }
    }

    function setUI(selectorSearchField, englishTerms){
      if(selectorSearchField === '.gsfi'){
        //Adapt Google's UI
        document.querySelectorAll('.sfbgg')[0].setAttribute("style","height: 90px");
        document.getElementById('top_nav').setAttribute("style","margin-top: 31px;");

        //Create and append select list
        var selectList = document.createElement("SELECT");
        selectList.setAttribute("style","height: 25px; width: 160px; margin-top: 5px");
        selectList.id = "termList";
        document.querySelectorAll('.tsf-p')[0].appendChild(selectList);
        var defaultOption = document.createElement("option");
        defaultOption.value = 'Other Re-search terms';
        defaultOption.text = 'Other Re-search terms';
        selectList.add(defaultOption);
      }

      //Create and append the options
      for (var i = 0; i < Object.keys(englishTerms).length; i++) {
          var option = document.createElement("option");
          option.value = Object.keys(englishTerms)[i];
          option.text = Object.keys(englishTerms)[i];
          selectList.add(option);
      }
    }

    function init(){
        console.log('In init');
        chrome.runtime.sendMessage({
            selector: "selector",
            url: window.location.href
        }, function(response) {
            if( response.selectorSearchField !== false ){
                if(runSetUI !== false){
                  setUI(response.selectorSearchField, response.terms);
                  runSetUI = false;
                }
                getSearchTerm(response.selectorSearchField, response.selectorButton, response.selectorAutoComplete);
            } else {
                console.log('Selector not found');
            }
        });
    }

    function runWhenReady(){
        if( document.readyState !== 'complete' ){
            setTimeout( runWhenReady, 100 );
            return false;
        }

        console.log('document is complete');

        chrome.runtime.sendMessage({
            runState: "?"
        }, function(response) {
            runState = response.runState;

            if(runState === 'enabled' && runInit === true){
                init();
                runInit = false;
            } else if( runState === 'disabled' ){
                console.log('runState DISABLED');
            }
        });
    }

    //first time content script runs
    runWhenReady();

    chrome.runtime.onMessage.addListener(
        function( request, sender, sendResponse ) {
            if ( request.runState === 'disabled' ){
                runState = request.runState;

                sendResponse({
                    message: 'received disabled'
                });
            } else if( request.runState === 'enabled' ){
                runState = request.runState;
                if( document.readyState === 'complete' ){
                    console.log('document is complete');
                    if( runInit === true ){
                        init();
                        runInit = false;
                    }
                }
                sendResponse({
                    message: 'received enabled'
                });
            } else {
                console.log( 'Message from event page was not handled' );
            }

            return true;
        }
    );
})();
