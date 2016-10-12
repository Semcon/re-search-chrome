

var val ="";
var jsonTermsGoogle;
var jsonTermsBing;
var googleURL;
var bingURL;
var currentTerms;
var currentURL;
var jsonData;



//First time running script to check what value runState is in chrome storage.
//If runState is undefined it is gets set to enabled otherwise it gets the value.
chrome.storage.sync.get("runState", function(data) {
  val = data.runState;
  console.log('val: ', val);
  if(typeof val === 'undefined'){
    chrome.storage.sync.set({'runState': 'enabled'}, function () {
      console.log('Saved', 'runState', 'enabled');
      val = 'enabled';
    });
  }
  return true;
});


var xhr = new XMLHttpRequest();
xhr.open("GET", "https://api.myjson.com/bins/4we1m", true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    jsonData = JSON.parse(xhr.responseText);
  }
}
xhr.send();


function showWindows(request){
  var link = currentURL + currentTerms[request];
  console.log('Link: ' , link);
    chrome.windows.getCurrent( {}, function( window ){
        console.log( window );
        chrome.windows.create( {
          height: window.height,
          left: window.width / 2 + 8,
          state: 'normal',
          top: 0,
          type: 'normal',
          url: link,
          width: window.width / 2 + 8
        } );

        chrome.windows.update( window.id, {
          height: window.height,
          state: 'normal',
          width: window.width / 2 + 8
        } );
    });
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //content script asks if extension is on/off
    if (request.runState === '?'){
      chrome.storage.sync.get("runState", function(data) {
        val = data.runState;
        sendResponse({runState: val});
      });
    }

    //content script is asking for search engine
    else if(request.searchEngine === 'searchEngine'){
      var url = request.url;
      // Loop over all engines
      if(jsonData !== null){
        for( var i = 0; i < jsonData.engines.length; i = i + 1 ){
          var matchCount = 0;

          // Loop over all required matches for the engine
          for( var matchIndex = 0; matchIndex < jsonData.engines[ i ].match.length; matchIndex = matchIndex + 1 ){
            if( url.indexOf( jsonData.engines[ i ].match[ matchIndex ] ) > -1 ){
              // We have a match, increment our counter
              console.log('found match incrementing');
              matchCount = matchCount + 1;
            }
          }

          // If we have the same number of matches as required matches we have a valid site
          if( matchCount === jsonData.engines[ i ].match.length ){
            console.log( 'Valid site' );
            sendResponse({selector: jsonData.engines[i].selector});
            currentTerms = jsonData.engines[i].terms;
            currentURL = jsonData.engines[i].url;
            return true;
          }
        }
        console.log('Url:' , url);
        sendResponse({selector: false});
      }    
    }

    //content script is sending terms
    else if(typeof currentTerms !== 'undefined' && currentTerms.hasOwnProperty(request)){
      console.log('term is found');
      showWindows(request);
    }

    //From popup
    else if(request.runState === 'changeState'){
      console.log('ChangeState from popup / current value is: ' , val);
      if(val  === 'enabled'){
        chrome.storage.sync.set({'runState': 'disabled'}, function () {
          console.log('Saved', 'runState', 'disabled');
          val = 'disabled';
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {runState: "disabled"}, function(response) {
              console.log(response.message);
            });
          });
          sendResponse({runState: val});
        });
      }
      else if(val === 'disabled'){
        chrome.storage.sync.set({'runState': 'enabled'}, function () {
          console.log('Saved', 'runState', 'enabled');
          val = 'enabled';
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {runState: "enabled"}, function(response) {
                console.log(response.message);
            });
          });
          sendResponse({runState: val});
        });
      }
    }
    else{
      console.log('Message to event page was not handled');
    }
    return true;
});
