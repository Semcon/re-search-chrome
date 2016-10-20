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
  console.log('Selector: ', selectorInput);
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

  window.addEventListener( 'keydown', function( event ){
     if( event.keyCode === 13 ){
       sendText(element.value);
     }
  });

//  console.log(document.querySelectorAll(selectorAutoComplete)[0]);
/*  document.querySelectorAll(selectorAutoComplete)[0].addEventListener('click', function (e) {
      console.log('autocomplete was clicked');
      sendText(element.value);
  });
*/
  document.querySelectorAll(selectorButton)[0].addEventListener('click', function (e) {
      console.log('search button was clicked');
      sendText(element.value);
  });
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
