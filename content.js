var runState;
var runInit = true;
var elements;




function sendText( text ){
  console.log('in sendText');
  if(runState === 'enabled' && typeof text !== 'undefined'){
    console.log( 'Sending', text );
    chrome.runtime.sendMessage( text, function(response) {
      if(response){
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

  if(typeof selectorAutoComplete !== 'undefined'){
    window.addEventListener( 'keydown', function( event ){
       if( event.keyCode === 13 ){
         console.log('enter was pressed');
         sendText(element.value);
       }
    });

    window.addEventListener('click', function (event) {
      console.log(event);
        if( String(event.target.classList).indexOf( selectorAutoComplete.replace( '.', '' ) ) > -1 ){
          console.log('autocomplete was clicked');
          sendText(event.target.outerText);
        }
        else if(String(event.target.parentElement.classList).indexOf( selectorAutoComplete.replace( '.', '' ) ) > -1 ){
          console.log('autocomplete was clicked');
          sendText(event.target.parentElement.outerText);
        }
        else if(event.target.children.length > 0){
          for(var i = 0; i < event.target.children.length; i++){
            if(event.target.children[i].children.length > 0){
              for(var j = 0; j < event.target.children[i].children.length; j++){
                if(String(event.target.children[i].children[j].className).indexOf( selectorAutoComplete.replace( '.', '' ) ) > -1){
                  console.log('autocomplete was clicked');
                  sendText(event.target.children[i].children[j].outerText);
                }
              }
            }
          }
        }
    });
  }
  if(typeof selectorButton !== 'undefined'){
    document.querySelectorAll(selectorButton)[0].addEventListener('click', function () {
        console.log('search button was clicked');
        sendText(element.value);
    });
  }
}

function init(){
  console.log('In init');
  chrome.runtime.sendMessage({selector: "selector", url: window.location.href}, function(response) {
    if(response.selectorSearchField !== false){
      getSearchTerm(response.selectorSearchField, response.selectorButton, response.selectorAutoComplete);
    }
    else{
      console.log('Selector not found');
    }
  });
}

//first time content script runs
if( document.readyState === 'complete' ){
  console.log('document is complete');

  console.log('Run init: ', runInit);
  chrome.runtime.sendMessage({runState: "?"}, function(response) {
    runState = response.runState;
    console.log('runState in contentscript: ', runState);

    if(runState === 'enabled' && runInit === true){
      console.log('runstate = enabled and runInit = true');
      document.querySelectorAll('.sfbgg')[0].setAttribute("style","height:80px");
      document.querySelectorAll('.sfbgg')[0].setAttribute("style","border-bottom:none");
      document.getElementById('top_nav').setAttribute("style","margin-top:50px");
      //document.getElementById('rcnt').setAttribute("style","margin-top:50px");

      var btn = document.createElement('BUTTON');
      btn.setAttribute("style","margin-top:5px");
      btn.setAttribute("style","height:28px");
      var t = document.createTextNode('CLICK ME');
      btn.appendChild(t);
      document.querySelectorAll('.tsf-p')[0].appendChild(btn);

      init();
      runInit = false;
    }
    else if(runState === 'disabled'){
      console.log('runState DISABLED');
    }
  });
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.runState === 'disabled'){
      runState = request.runState;
      console.log('runstate: ', runState);
      sendResponse({message: 'received disabled'});
    }
    else if(request.runState === 'enabled'){
      runState = request.runState;
      console.log('runstate: ', runState);

      if( document.readyState === 'complete' ){
          console.log('document is complete');
          if(runInit === true){
              init();
              runInit = false;
          }
      }
      sendResponse({message: 'received enabled'});
    }
    else{
      console.log('Message from event page was not handled');
    }
    return true;
});
