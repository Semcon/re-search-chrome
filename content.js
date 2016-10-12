var runState;
var runInit = true;
var elements;

function outputText( text ){
    if(runState === 'enabled'){
      console.log( 'Sending', text );
      chrome.runtime.sendMessage( text, function(response) {
         //callback
      });
    }
}

function getSearchTerm(selector){
  console.log('Selector: ', selector);
  elements = document.querySelectorAll(selector);
  if( elements.length === 0 ){
    setTimeout( init, 100 );
    return false;
  }
  var element = elements[ 0 ];

  if( element.value.length > 0 ){
     outputText( element.value );
  }
 element.addEventListener( 'input', function( event ){
     outputText( event.target.value );
  });
}

function init(){
  console.log('In init');
  chrome.runtime.sendMessage({searchEngine: "searchEngine", url: window.location.href}, function(response) {
    if(response.selector !== false){
      getSearchTerm(response.selector);
    }
    else{
      console.log('Search engine not found');
    }
  });
}


//first time content script runs
if( document.readyState === 'complete' ){
    console.log('document is complete');

    chrome.runtime.sendMessage({runState: "?"}, function(response) {
      runState = response.runState;
      console.log('runState in contentscript: ', runState);

      if(runState === 'enabled' && runInit === true){
        console.log('in runstate equals enabled');
        init();
        runInit = false;
      }
      else if(runState === 'disabled'){
        console.log('runState is not enabled');
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
