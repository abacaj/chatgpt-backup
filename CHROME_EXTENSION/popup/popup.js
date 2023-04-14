function getDateFormat(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}
function jsonToMarkdown(json, userLabel = "USER:", assistantLabel = "ASSISTANT:") {
  let output = '';
  const userIcon = '![User](assets/mdi-user.png)';
  const assistantIcon =
    '![Assistant](assets/tabler-brand-openai-1.png)';
  for (const message of json.messages) {
    if (message.role === 'user' || message.role === 'assistant') {
      output += `${message.role === 'user' ? userLabel : assistantLabel}\r\n\r\n${message.content[0]}\n\n---\n\n`;
    }
  }
  return output;
}

function downloadMarkdownZip(chats, userLabel, assistantLabel) {
  const dateStr = getDateFormat(new Date());
  const zip = new JSZip();
  const onlyOneChat = chats.length === 1;
  if (onlyOneChat) {
    console.log('only one chat');
    const title = chats[0].title || 'Untitled';
    const markdown = jsonToMarkdown(chats[0], userLabel, assistantLabel);
    saveAs(new Blob([markdown], { type: 'text/markdown' }), `${title}.md`);
  } else {
    for (let chat of chats) {
      const title = chat.title || 'Untitled';
      const markdown = jsonToMarkdown(chat, userLabel, assistantLabel);
      zip.file(`${title}.md`, markdown);
    }
    zip.generateAsync({ type: "blob" })
      .then(function (content) {
        saveAs(content, `gpt-backup-${dateStr}.zip`);
      });
  }
}

function downloadJson(data) {
  if (!data) {
    console.error('No data');
    return;
  };
  console.log('anything here?');
  const jsonString = JSON.stringify(data, null, 2);
  const jsonBlob = new Blob([jsonString], { type: 'application/json' });
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');

  saveAs(jsonBlob, `gpt-backup-${dateStr}.json`);
}

document.addEventListener('DOMContentLoaded', function () {
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

    document.getElementById('download-as-json').addEventListener('click', function () { //<-- this is the button
      let counter = 0;
      updateProgress('This may take a few minutes...');
      const port = chrome.runtime.connect({ name: "chatFetched" });
      port.postMessage({ message: 'backUp', startOffset, stopOffset });
      port.onMessage.addListener(function (msg) {
        console.log(1, msg);
        if (msg.message === 'chatProcessed') {
          counter++;
          updateProgress(`# ${counter} : ${msg.title}`)
        } else if (msg.message === 'backUp done') {
          updateProgress('Download complete');
          downloadJson(msg.allConversations);
        }
      });
    });

    document.getElementById('download-as-markdown').addEventListener('click', function () {// <-- this is the button
      let counter = 0;
      updateProgress('This may take a few minutes...');
      const port = chrome.runtime.connect({ name: "chatFetched" });
      port.postMessage({ message: 'backUp', startOffset, stopOffset });
      port.onMessage.addListener(function (msg) {
        console.log(1, msg);
        if (msg.message === 'chatProcessed') {
          counter++;
          updateProgress(`# ${counter} : ${msg.title}`)
        } else if (msg.message === 'backUp done') {
          updateProgress('Download complete');
          downloadMarkdownZip(msg.allConversations, userLabel, assistantLabel);
        }
      });
    });

  });

  document.getElementById('download-current-chat-as-json').addEventListener('click', function () {
    updateProgress('Chat downloaded as json');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage({ message: 'backUpSingleChat', tabs },
        function (response) {
          downloadJson(response.conversation);
        })
    });
  });

  document.getElementById('download-current-chat-as-markdown').addEventListener('click', function () {
    updateProgress('Chat downloaded as markdown');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage({ message: 'backUpSingleChat', tabs },
        function (response) {
          downloadMarkdownZip(response.conversation, userLabel, assistantLabel);
        });
    });
  });

});

function updateProgress(text) {
  const progressDiv = document.getElementById('progress');
  progressDiv.innerHTML = text;
}
function updateProgressPercentage(percentage) {
  const progressDiv = document.getElementById('progress');
  progressDiv.innerHTML = `Download progress: ${percentage}%`;
}