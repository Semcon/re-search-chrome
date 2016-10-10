var runState;


function outputText( text ){
    console.log( text );
    var para = document.createElement("P");
    var t = document.createTextNode( text );
    para.appendChild(t);
    document.body.appendChild(para);
}

function getSearchTerm(){
  let elements = document.querySelectorAll('.gsfi');
  if( elements.length === 0 ){
    setTimeout( getSearchTerm, 100 );
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


//first time content script runs
if( document.readyState === 'complete' ){
    console.log('document is complete');

    chrome.runtime.sendMessage({runState: "?"}, function(response) {
      runState = response.runState;
      console.log('runState in contentscript: ', runState);

      if(runState === 'enabled'){
        console.log('in runstate equals enabled');
        getSearchTerm();
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
          getSearchTerm();
      }
      sendResponse({message: 'received enabled'});
    }
    else{
      console.log('Message from event page was not handled');
    }
    return true;
});
