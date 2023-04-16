document.addEventListener('DOMContentLoaded', function () {
  const progressDiv = document.getElementById('progress');
  // const zip = JSZip();
    // get color scheme
    chrome.storage.local.get(['colorScheme'], function (result) {
      const container = document.querySelector('.extension-container');
      container.classList.add(result.colorScheme);
      console.log('popup.js colorScheme', result);
    });
    let userLabel = "USER:";
    let assistantLabel =  "ASSISTANT:";

  chrome.storage.sync.get(['startOffset', 'stopOffset', 'userLabel', 'assistantLabel'], function (result) {
    const startOffset = result.startOffset || 0;
    const stopOffset = result.stopOffset || -1;
    userLabel = result.userLabel || "USER:";
    assistantLabel = result.assistantLabel || "ASSISTANT:";

    document.getElementById('download-as-json').addEventListener('click', function () { //<-- this is the All JSON button
      progressDiv.innerHTML = 'this may take a few minutes...';

      chrome.runtime.sendMessage( { message: 'backUpAllAsJSON', startOffset, stopOffset },
        function (response) {
          progressDiv.innerHTML = 'Download complete';
        }
        )
    });

    document.getElementById('download-as-markdown').addEventListener('click', function () {// <-- this is the All Markdown button
      progressDiv.innerHTML = 'this may take a few minutes...';
      chrome.runtime.sendMessage( 
        {message: 'backUpAllAsMARKDOWN', startOffset, stopOffset, userLabel, assistantLabel },
        function (response) {
          progressDiv.innerHTML = 'Download complete';
        })
    });
  });

  document.getElementById('download-current-chat-as-json').addEventListener('click', function () {
    progressDiv.innerHTML = 'Chat downloaded as json';
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage({ message: 'backUpSingleChat', tabs, downloadType: 'json' },
        function (response) {
          progressDiv.innerHTML = 'Download complete';
        })
    });
  });

  document.getElementById('download-current-chat-as-markdown').addEventListener('click', function () {
    progressDiv.innerHTML = 'Chat downloaded as markdown';
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage({ message: 'backUpSingleChat',tabs, downloadType: 'markdown'},
        function (response) {
          progressDiv.innerHTML = 'Download complete';
        });
    });
  });

});
const port = chrome.runtime.connect({ name: 'progress'});
port.onMessage.addListener(function (msg) {
  const progressDiv = document.getElementById('progress');
  if (msg.text) progressDiv.innerHTML = `#${msg.total}: ${msg.text}`;
});