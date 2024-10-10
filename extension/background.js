let userInfo = null;

function checkAuthStatus() {
  fetch('https://trackjobs.online/api/check-auth', {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    userInfo = data.isAuthenticated ? { isAuthenticated: true } : null;
    chrome.storage.local.set({ userInfo });
  })
  .catch(error => {
    console.error('Error:', error);
    userInfo = null;
    chrome.storage.local.set({ userInfo });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAuth') {
    chrome.storage.local.get('userInfo', (result) => {
      if(result.userInfo)
        sendResponse(result.userInfo);
      else{
        checkAuthStatus();
        chrome.storage.local.get('userInfo', (result) => {
          sendResponse(result.userInfo);
        })
      }
    });
    return true;
  }if (request.action === 'openTab') {
    chrome.tabs.create({url: request.url});
  } else if (request.action === 'toggleModal') {
    chrome.tabs.sendMessage(sender.tab.id, {action: 'toggleModal'});
  } else if (request.action === 'sendJobData') {
    sendJobData(request.content, request.url, request.jobStatus, sendResponse);
    return true;
  }
});

function sendJobData(content, url, action, sendResponse) {
  fetch('https://trackjobs.online/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, url, jobStatus: action }),
    credentials: 'include',
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      sendResponse({ success: false, message: data.error });
    } else {
      sendResponse({ success: true, message: data.message, job: data.newJob });
    }
  })
  .catch(error => {
    sendResponse({ success: false, message: error.message });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  checkAuthStatus();
});

chrome.cookies.onChanged.addListener((changeInfo) => {
  if ((changeInfo.cookie.domain === 'localhost' || changeInfo.cookie.domain === 'trackjobs.online') && changeInfo.cookie.name === 'auth') {
    checkAuthStatus();
  }
});

chrome.action.onClicked.addListener((tab) => {
    checkAuthStatus(); // might be expensive but required for good user experience
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
});

