
function clickHandler(e) {
    chrome.extension.sendMessage({runState: "changeState"}, function(response) {
      console.log("Run state is: " , response.runState);
      var runState = response.runState;
      if(runState === 'enabled'){
        console.log('value',document.getElementsByName("stateBtn")[0].childNodes[0].nodeValue);
        var btn = document.getElementsByName("stateBtn")[0];
        btn.childNodes[0].nodeValue = 'ON';
      }
      else if(runState === 'disabled'){
        console.log(document.getElementsByName("stateBtn")[0].childNodes[0].nodeValue);
        var btn = document.getElementsByName("stateBtn")[0];
        btn.childNodes[0].nodeValue = 'OFF';
      }
    });
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('domContentLoaded');
  chrome.extension.sendMessage({runState: "getState"}, function(response) {
    console.log("Run state is: " , response.runState);
    var runState = response.runState;
    if(runState === 'enabled'){
      var btn = document.createElement("BUTTON");
      btn.name = 'stateBtn';
      btn.addEventListener('click', clickHandler);
      var t = document.createTextNode("ON")
      btn.appendChild(t);
      document.body.appendChild(btn);
    }
    else if(runState === 'disabled'){
      var btn = document.createElement("BUTTON");
      btn.name = 'stateBtn';
      btn.addEventListener('click', clickHandler);
      var t = document.createTextNode("OFF");
      btn.appendChild(t);
      document.body.appendChild(btn);
    }
  });
})
