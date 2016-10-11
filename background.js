

var val ="";
//chrome.storage.sync.clear();

//First time running script to check what value runState is in chrome storage.
//If runState is undefined it is gets set to enabled otherwise it gets the value.
chrome.storage.sync.get("runState", function(data) {
  val = data.runState;
  console.log('val: ', val);
  if(typeof val === 'undefined'){
    console.log('value is undefined');
    chrome.storage.sync.set({'runState': 'enabled'}, function () {
      console.log('Saved', 'runState', 'enabled');
      val = 'enabled';
      console.log('val: ', val);
    });
  }
  return true;
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //From content script
    if (request.runState === '?'){
      chrome.storage.sync.get("runState", function(data) {
        console.log('Value after getting it again: ', data.runState);
        val = data.runState;
        console.log('response: ', val);
        sendResponse({runState: val});
      });
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
