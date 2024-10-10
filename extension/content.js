function createModal() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container-trackjobs';
    const shadowRoot = modalContainer.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
        <style>            
           #modal_trackjobs_ {
                all: initial;
                font-family: 'Inter', sans-serif;
                position: fixed;
                top: 10px;
                right: 10px;
                width: 270px;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.10);
                z-index: 9991;
                padding: 16px;
                transition: all 0.2s ease;
            }

            #header_trackjobs_ {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16px;
            }

            #logo_trackjobs_ {
                width: 36px;
                height: 36px;
                margin-right: 8px;
            }

            #title_trackjobs_ {
                font-size: 24px;
                font-weight: 700;
                color: #5d17ea;
                margin: 0;
            }

            button, select {
                width: 100%;
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.1s ease;
            }

            button:hover, select:hover {
                opacity: 0.9;
            }

            .btn-primary {
                background-color: #5d17ea;
                color: white;
            }

            .btn-secondary {
                background-color: #f0ebfe;
                color: #5d17ea;
            }

            #actionSelect_trackjobs_ {
                background-color: #f0ebfe;
                color: #5d17ea;
                background-repeat: no-repeat;
                background-position: right 10px center;
                background-size: 16px;
            }

            #actionSelect_trackjobs_:focus {
                outline: none; 
                border: 1.5px solid #5d17ea;
            }

            #actionSelect_trackjobs_ > option {
                color: #5d17ea;
                font-weight: 600;
                font-size: 14px;
            }

            #output_trackjobs_ {
                margin-top: 12px;
                padding: 12px;
                background-color: #f0ebfe;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                text-align : center;
                line-height: 1.4;
                display: none;
            }

            #close_trackjobs_ {
                background: none;
                border: none;
                font-size: 28px;
                color: #5d17ea;
                cursor: pointer;
                padding: 0;
                margin: 0;
                width: auto;
                font-weight: 400;
                opacity: 0.7;            
            }

            #close_trackjobs_:hover {
                opacity: 0.9;
            }

            .section-container {
                border-radius: 8px;
                border: solid 1px #5d17ea;
                padding: 12px;
                margin-bottom: 12px;
            }

            #loginStatus_trackjobs_ {
                color : black;
                margin: 0 0 12px;
                text-align: center;
                font-size: 12px;
                font-weight: 600;
            }
        </style>
        <div id="modal_trackjobs_">
            <header id="header_trackjobs_">
                <img src="chrome-extension://${chrome.runtime.id}/trackjobs_logo_48.png" alt="TrackJobs Logo" id="logo_trackjobs_">
                <h1 id="title_trackjobs_">TrackJobs</h1>
                <button id="close_trackjobs_">&times;</button>
            </header>
            <div class="separator"></div>
            <main>
                <div style="padding:10px; border-radius:8px; border : solid 1px #5d17ea; margin-top : 10px; margin-bottom : 10px; display : flex; flex-direction : column; gap:5px;">                
                    <p id="loginStatus_trackjobs_" style="text-align:center; font-size: 14px; font-weight:500;">Checking login status...</p>
                    <button id="checkAuth_trackjobs_" class="btn-primary">Refresh Login Status</button>
                </div>
                <div style="padding:10px; border-radius:8px; border : solid 1px #5d17ea; margin-top : 10px; margin-bottom : 10px; display : flex; flex-direction : column; gap:10px;">                 
                    <button id="login_trackjobs_" class="btn-secondary">Login</button>
                    <button id="dashboard_trackjobs_" class="btn-primary">Go to Dashboard</button>
                </div>
                <div style="padding:10px; border-radius:8px; border : solid 1px #5d17ea; margin-top : 10px; margin-bottom : 10px; display : flex; flex-direction : column; gap:10px;">                 
                    <select id="actionSelect_trackjobs_">
                        <option value="">Select Application Status</option>
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="OA/Assignment">OA/Assignment</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                        <option value="Other">Other</option>
                    </select>
                    <button id="action_trackjobs_" class="btn-primary" disabled>Track Job</button>
                    <div id="output_trackjobs_"></div>
                </div>
            </main>
        </div>
    `;

    document.body.appendChild(modalContainer);
    return modalContainer;
}

function toggleModal() {
    const modalContainer = document.getElementById('modal-container-trackjobs');
    if (modalContainer) {
        modalContainer.remove();
    } else {
        createModal();
        addEventListeners();
        checkAuthStatus();
    }
}

function addEventListeners() {
    const shadowRoot = document.getElementById('modal-container-trackjobs').shadowRoot;
    const closeButton = shadowRoot.getElementById("close_trackjobs_");
    const checkAuthButton = shadowRoot.getElementById("checkAuth_trackjobs_");
    const loginButton = shadowRoot.getElementById("login_trackjobs_");
    const dashboardButton = shadowRoot.getElementById("dashboard_trackjobs_");
    const actionSelect = shadowRoot.getElementById("actionSelect_trackjobs_");
    const actionButton = shadowRoot.getElementById("action_trackjobs_");

    closeButton.addEventListener('click', toggleModal);
    checkAuthButton.addEventListener('click', checkAuthStatus);
    loginButton.addEventListener('click', handleLogin);
    dashboardButton.addEventListener('click', openDashboard);
    actionSelect.addEventListener('change', handleActionSelect);
    actionButton.addEventListener('click', handleAction);

    // Close modal when clicking outside
    document.addEventListener('click', (event) => {
        const modalContainer = document.getElementById('modal-container-trackjobs');
        if (modalContainer && !modalContainer.contains(event.target)) {
            toggleModal();
        }
    });

    // Prevent closing when clicking inside the modal
    shadowRoot.getElementById('modal_trackjobs_').addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

function checkAuthStatus() {
    chrome.runtime.sendMessage({ action: 'checkAuth' }, (response) => {
        const shadowRoot = document.getElementById('modal-container-trackjobs').shadowRoot;
        const loginStatus = shadowRoot.getElementById('loginStatus_trackjobs_');
        const loginButton = shadowRoot.getElementById('login_trackjobs_');
        const dashboardButton = shadowRoot.getElementById('dashboard_trackjobs_');
        const actionSelect = shadowRoot.getElementById('actionSelect_trackjobs_');

        if (chrome.runtime.lastError) {
            console.error('Error checking auth status:', chrome.runtime.lastError);
            loginStatus.textContent = 'Error checking login status';
            return;
        }

        if (response?.isAuthenticated) {
            loginStatus.textContent = 'Logged in';
            loginButton.textContent = 'Logout';
            dashboardButton.style.display = 'block';
            actionSelect.disabled = false;
        } else {
            loginStatus.textContent = 'Not logged in';
            loginButton.textContent = 'Login';
            dashboardButton.style.display = 'none';
            actionSelect.disabled = true;
        }
    });
}

function handleLogin() {
    const shadowRoot = document.getElementById('modal-container-trackjobs').shadowRoot;
    const loginButton = shadowRoot.getElementById('login_trackjobs_');
    const action = loginButton.textContent === 'Login' ? 'sign-in' : 'api/sign-out';
    chrome.runtime.sendMessage({ action: 'openTab', url: `https://trackjobs.online/${action}` });
}

function openDashboard() {
    chrome.runtime.sendMessage({ action: 'openTab', url: 'https://trackjobs.online/dashboard' });
}

function handleActionSelect() {
    const shadowRoot = document.getElementById('modal-container-trackjobs').shadowRoot;
    const actionSelect = shadowRoot.getElementById('actionSelect_trackjobs_');
    const actionButton = shadowRoot.getElementById('action_trackjobs_');
    actionButton.disabled = !actionSelect.value;
}

function handleAction() {
    const shadowRoot = document.getElementById('modal-container-trackjobs').shadowRoot;
    const actionSelect = shadowRoot.getElementById('actionSelect_trackjobs_');
    const output = shadowRoot.getElementById('output_trackjobs_');
    const action = actionSelect.value;
    chrome.runtime.sendMessage({action: 'checkAuth'}, (response) => {
        if (response?.isAuthenticated) {
            const pageContent = document.body.innerText;
            const pageUrl = window.location.href;
            console.log(pageContent, pageUrl, action);
            chrome.runtime.sendMessage({
                action: 'sendJobData',
                content: pageContent,
                url: pageUrl,
                jobStatus: action
            }, (response) => {
                output.style.display = 'block';                
                if (response.success) {
                    output.textContent = 'Job data saved sucessfully';
                } else {
                    output.textContent = `Error: ${response.message}`;
                }
            });
        } else {
            output.textContent = 'Please log in to save job data.';
        }
    });
}

toggleModal();