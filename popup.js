function clickHandler(e) {
    chrome.extension.sendMessage({runState: "changeState"}, function(response) {
      console.log("Run state is: " , response.runState);
      var runState = response.runState;
      if(runState === 'enabled'){
        document.getElementById("click-me").innerHTML = 'ON';
      }
      else if(runState === 'disabled'){
        document.getElementById("click-me").innerHTML = 'OFF';
      }
    });
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('click-me').addEventListener('click', clickHandler);
})
