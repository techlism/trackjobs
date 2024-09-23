let userInfo = null;

chrome.runtime.onInstalled.addListener(() => {
  checkAuthStatus();
});

chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.cookie.domain === 'localhost' && changeInfo.cookie.name === 'auth') {
    checkAuthStatus();
  }
});

function checkAuthStatus() {
  fetch('http://localhost:3000/api/check-auth', {
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
      sendResponse(result.userInfo);
    });
    return true;
  }
});