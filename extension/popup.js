document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');
  const readPageButton = document.getElementById('readPage');
  const loginStatus = document.getElementById('loginStatus');
  const output = document.getElementById('output');

  const API_URL = 'http://localhost:3000';

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
        if (loginButton) loginButton.textContent = 'Logout';
        if (readPageButton) readPageButton.disabled = false;
      } else {
        safelySetTextContent(loginStatus, 'Not logged in');
        if (loginButton) loginButton.textContent = 'Login';
        if (readPageButton) readPageButton.disabled = true;
      }
    });
  }

  checkAuthStatus();

  if (loginButton) {
    loginButton.addEventListener('click', () => {
      const action = loginButton.textContent === 'Login' ? 'sign-in' : 'sign-out';
      chrome.tabs.create({url: `${API_URL}/${action}`});
    });
  }

  if (readPageButton) {
    readPageButton.addEventListener('click', () => {
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
            sendJobData(pageContent, pageUrl);
          } else {
            safelySetTextContent(output, 'No content retrieved.');
          }
        });
      });
    });
  }

  function sendJobData(content, url) {
    chrome.runtime.sendMessage({action: 'checkAuth'}, (response) => {
      if (response?.isAuthenticated) {
        fetch(`${API_URL}/api/jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, url, jobStatus: "Saved" }),
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