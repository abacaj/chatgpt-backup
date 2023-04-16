function generateOffsets(startOffset, total) {
  const interval = 20;
  const start = startOffset + interval;
  const offsets = [];

  for (let i = start; i <= total; i += interval) {
    offsets.push(i);
  }

  return offsets;
}

function sleep(ms = 1000) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

function parseConversation(rawConversation) {
  const title = rawConversation.title;
  const create_time = rawConversation.create_time;
  const mapping = rawConversation.mapping;
  const keys = Object.keys(mapping);
  const messages = [];

  for (const k of keys) {
    const msgPayload = mapping[k];
    const msg = msgPayload.message;
    if (!msg) continue;

    const role = msg.author.role;
    const content = msg.content.parts;
    const model = msg.metadata.model_slug;
    const create_time = msg.create_time;

    messages.push({
      role,
      content,
      model,
      create_time,
    });
  }

  return {
    messages,
    create_time,
    title,
  };
}

function getRequestCount(total, startOffset, stopOffset) {
  if (stopOffset === -1) return total;

  return stopOffset - startOffset;
}

function logProgress(total, messages, offset) {
  const progress = Math.round((messages / total) * 100);
  console.log(`GPT-BACKUP::PROGRESS::${progress}%::OFFSET::${offset}`);
}

async function storeToken(token) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ access_token: token }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
async function getToken() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("access_token", (items) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(items.access_token);
      }
    });
  });
}
async function loadToken() {
  const storedToken = await getToken();
  if (storedToken) return storedToken;

  const res = await fetch("https://chat.openai.com/api/auth/session");
  if (res.ok) {
    const accessToken = (await res.json()).accessToken;
    await storeToken(accessToken);
    return accessToken;
  } else {
    return Promise.reject("failed to fetch token");
  }
}

async function getFirstConversationId() {
  const token = await loadToken();

  const res = await fetch(
    "https://chat.openai.com/backend-api/conversations?offset=0&limit=1",
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    // if token expired delete it
    if (res.status === 401) {
      await chrome.storage.sync.remove("access_token");
    }
    throw new Error("failed to fetch conversation ids, token expired? try again");
  }

  const json = await res.json();
  return json.items[0].id;

}

async function getConversationIds(token, offset = 0) {
  const res = await fetch(
    `https://chat.openai.com/backend-api/conversations?offset=${offset}&limit=20`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error('failed to fetch conversation ids');
  }

  const json = await res.json();
  return {
    items: json.items.map((item) => ({ ...item, offset })),
    total: json.total,
  };
}

async function fetchConversation(token, id, maxAttempts = 3, attempt = 1) {
  const res = await fetch(
    `https://chat.openai.com/backend-api/conversation/${id}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const exceeded = attempt >= maxAttempts;
    if (res.status === 429 && !exceeded) {
      await sleep(30000);
      return fetchConversation(token, id, maxAttempts, attempt + 1);
    } else {
      throw new Error('failed to fetch conversation');
    }
  }

  return res.json();
}

async function getAllConversations(startOffset, stopOffset) {
  const token = await loadToken();

  // get first batch
  const { total, items: allItems } = await getConversationIds(
    token,
    startOffset,
  );

  // generate offsets
  const offsets = generateOffsets(startOffset, total);

  // don't spam api
  // fetch all offsets
  for (const offset of offsets) {
    // stop at offset
    if (offset === stopOffset) break;

    await sleep();

    const { items } = await getConversationIds(token, offset);
    allItems.push.apply(allItems, items);
  }

  const lastOffset =
    stopOffset === -1 ? offsets[offsets.length - 1] : stopOffset;

  const allConversations = [];
  const requested = getRequestCount(total, startOffset, stopOffset);

  console.log(`GPT-BACKUP::STARTING::TOTAL-OFFSETS::${lastOffset}`);
  console.log(`GPT-BACKUP::STARTING::REQUESTED-MESSAGES::${requested}`);
  console.log(`GPT-BACKUP::STARTING::TOTAL-MESSAGES::${total}`);
  for (const item of allItems) {
    // 60 conversations/min
    await sleep(1000);

    // log progress
    if (allConversations.length % 20 === 0) {
      logProgress(requested, allConversations.length, item.offset);
    }

    const rawConversation = await fetchConversation(token, item.id);
    const conversation = parseConversation(rawConversation);
    allConversations.push(conversation);
    const title = conversation.title || 'untitled';
    const shortTitle = title.length > 20 ? `${title.substring(0, 20)}...` : title;
    progressState = shortTitle;
    const total = allConversations.length;
    ports.forEach((port) => port.postMessage({ text: progressState, total }));
  }

  logProgress(requested, allConversations.length, lastOffset);

  return allConversations;
}

async function main(startOffset, stopOffset) {
  const allConversations = await getAllConversations(startOffset, stopOffset);
  return allConversations;
}

let progressState = '';
const ports = new Set();
chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name == 'progress');
  ports.add(port);
  port.postMessage({ text: progressState });
  port.onDisconnect.addListener(function () {
    ports.delete(port);
  });
});
importScripts('./jszip.js');
const zip = new JSZip();
function saveAs(contentString = '', fileType = 'text/plain', filename = 'file.txt') {
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1224027
  // Creating a download from generated content in Manifest V3 is not supported.
  // URL.createObjectURL() is not exposed in Manifest V3.
  // Example:
  //   chrome.downloads.download({
  //     url: URL.createObjectURL(new Blob([generatedData], {type: 'video/mp4'})),
  //     filename: 'video.mp4',
  // });
  // Workaround:
  let base64Data, dataUrl;
  if (fileType === 'application/zip') {
    base64Data = contentString;
    dataUrl = `data:${fileType};base64,${base64Data}`;
  } else {
    base64Data = btoa(unescape(encodeURIComponent(contentString)));// will fail if file too big
    dataUrl = `data:${fileType};base64,${base64Data}`;
  }

  chrome.downloads.download({
    url: dataUrl,
    filename: filename,
  }, downloadId => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      console.log('Download initiated with ID:', downloadId);
    }
  });
}
// This code runs when a network request is intercepted.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {// <-- here is where all happens
  if (request.message === 'getColorScheme') {
    chrome.storage.local.set({ colorScheme: request.colorScheme });
  }

  if (request.message === 'backUpAllAsJSON') {
    main(request.startOffset, request.stopOffset).then((allConversations) => {
      downloadJson(allConversations)
      sendResponse({ message: 'backUpAllAsJSON done' })
    });
  }
  if (request.message === 'backUpAllAsMARKDOWN') {
    console.log(request);
    main(request.startOffset, request.stopOffset).then((allConversations) => {
      downloadMarkdownZip(allConversations, request.userLabel, request.assistantLabel);
      sendResponse({ message: 'backUpAllAsMARKDOWN done' })
    });
  }

  if (request.message === 'backUpSingleChat') {
    handleSingleUrlId(request.tabs).then((conversation) => {
      if (request.downloadType === 'json') {
        downloadJson(conversation)
      } else {
        downloadMarkdownZip(conversation, request.userLabel, request.assistantLabel);
      }
      sendResponse({ message: 'backUpSingleChat done', conversation })
    });

  }
  return true;
});

async function handleSingleUrlId(tabs) {
  const url = tabs[0].url;
  const parsedUrl = new URL(url);
  const pathSegments = parsedUrl.pathname.split('/');
  const conversationId = pathSegments[pathSegments.length - 1];
  const regex = /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/g;
  const token = await loadToken();
  let id;
  if (!conversationId.match(regex)) {
    const res = await getConversationIds(token)
    id = res.items[0].id;
  } else {
    id = conversationId;
  }
  const rawConversation = await fetchConversation(token, id);
  const conversation = parseConversation(rawConversation);
  return [conversation];
}
function downloadMarkdownZip(chats, userLabel, assistantLabel) {
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const onlyOneChat = chats.length === 1;
  if (onlyOneChat) {
    const title = chats[0].title || 'untitled';
    const markdown = jsonToMarkdown(chats[0], userLabel, assistantLabel);
    saveAs(markdown, 'text/markdown', `${title}.md`);
  }else {
    for (let chat of chats) {
      const title = chat.title || 'untitled';
      const markdown = jsonToMarkdown(chat, userLabel, assistantLabel);
      zip.file(`${title}.md`, markdown);
    }
    zip.generateAsync({ type: 'base64' }).then((content) => {
      saveAs(content, 'application/zip', `gpt-backup-${dateStr}.zip`);
    });
  }
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
function downloadJson(data) {
  console.log(data);
  if (!data) {
    console.error('No data')
    return;
  }
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonString = JSON.stringify(data, null, 2);
  saveAs(jsonString, 'application/json', `gpt-backup-${dateStr}.json`);
}