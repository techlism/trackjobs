document.addEventListener('DOMContentLoaded', () => {
  const checkAuthButton = document.getElementById('checkAuthButton');
  const loginButton = document.getElementById('loginButton');
  const dashboardButton = document.getElementById('dashboardButton');
  const actionSelect = document.getElementById('actionSelect');
  const actionButton = document.getElementById('actionButton');
  const loginStatus = document.getElementById('loginStatus');
  const output = document.getElementById('output');

  const API_URL = 'https://trackjobs.online';

  function safelySetTextContent(element, text) {
    if (element) {
      element.textContent = text;
    } else {
      console.error(`Element not found when trying to set text: ${text}`);
    }
  }

  function checkAuthStatus() {
    chrome.runtime.sendMessage({action: 'checkAuth'}, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error checking auth status:', chrome.runtime.lastError);
        safelySetTextContent(loginStatus, 'Error checking login status');
        return;
      }
  
      if (response?.isAuthenticated) {
        safelySetTextContent(loginStatus, 'Logged in');
        loginButton.textContent = 'Logout';
        dashboardButton.style.display = 'block';
        actionSelect.disabled = false;
      } else {
        safelySetTextContent(loginStatus, 'Not logged in');
        loginButton.textContent = 'Login';
        dashboardButton.style.display = 'none';
        actionSelect.disabled = true;
      }
    });
  
    // Send a request to the server to check auth status
    fetch(`${API_URL}/api/check-auth`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      if (data.isAuthenticated) {
        chrome.storage.local.set({ userInfo: { isAuthenticated: true } });
      } else {
        chrome.storage.local.set({ userInfo: null });
      }
    })
    .catch(error => {
      console.error('Error checking auth status:', error);
    });
  }

  checkAuthStatus();

  checkAuthButton.addEventListener('click', checkAuthStatus);

  loginButton.addEventListener('click', () => {
    const action = loginButton.textContent === 'Login' ? 'sign-in' : 'api/sign-out';
    chrome.tabs.create({url: `${API_URL}/${action}`});
  });

  dashboardButton.addEventListener('click', () => {
    chrome.tabs.create({url: `${API_URL}/dashboard`});
  });

  actionSelect.addEventListener('change', () => {
    actionButton.disabled = !actionSelect.value;
  });

  actionButton.addEventListener('click', () => {
    const action = actionSelect.value;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error('Error querying tabs:', chrome.runtime.lastError);
        safelySetTextContent(output, `Error: ${chrome.runtime.lastError.message}`);
        return;
      }

      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: getPageContent
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error('Error executing script:', chrome.runtime.lastError);
          safelySetTextContent(output, `Error: ${chrome.runtime.lastError.message}`);
        } else if (results?.[0]?.result) {
          const pageContent = results[0].result;
          const pageUrl = tabs[0].url;
          sendJobData(pageContent, pageUrl, action);
        } else {
          safelySetTextContent(output, 'No content retrieved.');
        }
      });
    });
  });

  function sendJobData(content, url, action) {
    chrome.runtime.sendMessage({action: 'checkAuth'}, (response) => {
      if (response?.isAuthenticated) {
        fetch(`${API_URL}/api/jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, url, jobStatus: action }),
          credentials: 'include',
        })
        .then(response => response.json())
        .then(data => {
          safelySetTextContent(output, `Job data saved: ${data.message}`);
        })
        .catch(error => {
          safelySetTextContent(output, `Error saving job data: ${error.message}`);
        });
      } else {
        safelySetTextContent(output, 'Please log in to save job data.');
      }
    });
  }

  function getPageContent() {
    return document.body.innerText;
  }
});