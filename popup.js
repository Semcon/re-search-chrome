function clickHandler(e) {
    chrome.extension.sendMessage({runState: "changeState"}, function(response) {
  //      this.close(); // close the popup when the background finishes processing request
    });
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('click-me').addEventListener('click', clickHandler);
})
