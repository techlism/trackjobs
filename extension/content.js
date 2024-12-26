function createModal() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container-trackjobs';
    const shadowRoot = modalContainer.attachShadow({ mode: 'open' });
    const closeIcon = `<svg width="35px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke=""><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.096"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22ZM8.96965 8.96967C9.26254 8.67678 9.73742 8.67678 10.0303 8.96967L12 10.9394L13.9696 8.96969C14.2625 8.6768 14.7374 8.6768 15.0303 8.96969C15.3232 9.26258 15.3232 9.73746 15.0303 10.0303L13.0606 12L15.0303 13.9697C15.3232 14.2625 15.3232 14.7374 15.0303 15.0303C14.7374 15.3232 14.2625 15.3232 13.9696 15.0303L12 13.0607L10.0303 15.0303C9.73744 15.3232 9.26256 15.3232 8.96967 15.0303C8.67678 14.7374 8.67678 14.2626 8.96967 13.9697L10.9393 12L8.96965 10.0303C8.67676 9.73744 8.67676 9.26256 8.96965 8.96967Z" fill="#582aff"></path> </g></svg>`;
    const modal = document.createElement('div');
    modal.innerHTML = `
        <modal id="modal_trackjobs_">
            <style>
                @font-face {
                    font-family: 'Geist';
                    src: url('${chrome.runtime.getURL('fonts/Geist.ttf')}') format('truetype');
                    font-weight: 100 900;
                    font-display: swap;
                    font-optical-sizing: auto;
                }

                #modal_trackjobs_ {
                    all: initial;
                    font-family: 'Geist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    position: fixed;
                    top: 8px;
                    right: 15px;
                    width: 240px;
                    background: #ffffff;
                    border-radius: 7px;
                    box-shadow: 0 4px 20px rgba(88, 42, 255, 0.08);
                    z-index: 9991;
                    padding: 10px;
                    transition: all 0.2s ease;
                    border: 1px solid rgba(88, 42, 255, 0.08);
                }

                #header_trackjobs_ {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                #logo_trackjobs_ {
                    width: 32px;
                    height: 32px;
                    margin-right: 8px;
                }

                #title_trackjobs_ {
                    font-size: 20px;
                    font-weight: 700;
                    color: #582aff;
                    margin: 0;
                    letter-spacing: -0.01em;
                }

                button {
                    width: 100%;
                    padding: 8px 14px;
                    border: none;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    font-family: 'Geist', sans-serif;
                    letter-spacing: -0.01em;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(88, 42, 255, 0.1);
                }

                button:active {
                    transform: translateY(0);
                }

                .btn-primary {
                    background-color: #582aff;
                    color: white;
                }

                .btn-primary:disabled {
                    background-color: #b1b2ff;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .btn-secondary {
                    background-color: #e7e8ff;
                    color: #582aff;
                }

                .custom-select-container {
                    position: relative;
                    width: 100%;
                }

                .custom-select {
                    position: relative;
                    width: 100%;
                }

                .select-selected {
                    appearance: none;
                    -webkit-appearance: none;
                    width: 85.6%;
                    padding: 8px 14px;
                    border: 1.5px solid #e7e8ff;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    font-family: 'Geist', sans-serif;
                    letter-spacing: -0.01em;
                    height: 15px;
                    background-color: white;
                    color: #582aff;
                    background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M7 15L12 20L17 15M7 9L12 4L17 9' stroke='%23582aff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                
                    display: flex;
                    align-items: center;
                }

                .select-selected:hover {
                    border-color: #b1b2ff;
                    box-shadow: 0 2px 4px rgba(88, 42, 255, 0.06);
                }

                .custom-select.active .select-selected {
                    border-color: #582aff;
                    border-radius: 12px 12px 0 0;
                }

                .select-items {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background-color: white;
                    border: 1.5px solid #582aff;
                    border-top: none;
                    border-radius: 0 0 12px 12px;
                    z-index: 950;
                    max-height: 200px;
                    overflow-y: auto;
                    box-shadow: 0 4px 12px rgba(88, 42, 255, 0.1);
                }

                .select-hide {
                    display: none;
                }

                .select-items div {
                    padding: 10px 10px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    color: #582aff;
                    transition: all 0.1s ease;                 
                }

                .select-items div:hover,
                .same-as-selected {
                    background-color: #f8f8ff;
                    box-shadow: 0 2px 8px rgba(88, 42, 255, 0.3);
                    border-radius: 12px;
                }

                .select-items div:last-child {
                    border-radius: 0 0 12px 12px;
                }

                .select-items::-webkit-scrollbar {
                    display: none;
                }

                .select-items::-webkit-scrollbar-track {
                    display: none;
                }

                .select-items::-webkit-scrollbar-thumb {
                    display: none;
                }

                .select-items::-webkit-scrollbar-thumb:hover {
                    display: none;
                }

                #close_trackjobs_ {
                    background: none;
                    border: none;
                    font-size: 35px;
                    color: #582aff;
                    cursor: pointer;
                    padding: 0;
                    margin: 0;
                    width: auto;
                    height: auto;
                    font-weight: 500;
                    opacity: 0.7;            
                }

                #close_trackjobs_:hover {
                    opacity: 1;
                    transform: none;
                    box-shadow: none;
                }

                .action-container {
                    padding: 12px;
                    border-radius: 16px;
                    background-color: #f8f8ff;
                    border: 1px solid #e7e8ff;
                    margin-bottom: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                #loginStatus_trackjobs_ {
                    color: #16053d;
                    margin: 0 0 4px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: 500;
                    letter-spacing: -0.01em;
                }

                .loading {
                    animation: pulse 1.5s infinite;
                    pointer-events: none;
                }

                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }

                .loading-text {
                    color: #582aff;
                    font-size: 13px;
                    font-weight: 500;
                    text-align: center;
                    margin: 8px 0;
                }

                #output_trackjobs_ {
                    margin-top: 10px;
                    padding: 10px;
                    background-color: #f8f8ff;
                    border: 1px solid #e7e8ff;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 500;
                    text-align: center;
                    line-height: 1.4;
                    display: none;
                    color: #582aff;
                }
            </style>
            <header id="header_trackjobs_">
                <img src="chrome-extension://${chrome.runtime.id}/trackjobs_logo_128.png" alt="TrackJobs Logo" id="logo_trackjobs_">
                <h1 id="title_trackjobs_">TrackJobs</h1>
                <button id="close_trackjobs_">
                    ${closeIcon}
                </button>
            </header>
            <main>
                <div class="action-container">                
                    <p id="loginStatus_trackjobs_">Checking login status...</p>
                    <button id="checkAuth_trackjobs_" class="btn-primary">Refresh Login Status</button>
                </div>
                <div class="action-container">                 
                    <button id="login_trackjobs_" class="btn-secondary">Login</button>
                    <button id="dashboard_trackjobs_" class="btn-primary">Go to Dashboard</button>
                </div>
                <div class="action-container">                 
                    <div class="custom-select-container">
                        <div class="custom-select">
                            <div class="select-selected">Select Application Status</div>
                            <div class="select-items select-hide">
                                <div data-value="">Select Application Status</div>
                                <div data-value="Saved">Saved</div>
                                <div data-value="Applied">Applied</div>
                                <div data-value="OA/Assignment">OA/Assignment</div>
                                <div data-value="Interview">Interview</div>
                                <div data-value="Offer">Offer</div>
                                <div data-value="Rejected">Rejected</div>
                                <div data-value="Withdrawn">Withdrawn</div>
                                <div data-value="Other">Other</div>
                            </div>
                            <select id="actionSelect_trackjobs_" style="display: none">
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
                        </div>
                    </div>
                    <button id="action_trackjobs_" class="btn-primary" disabled>Track Job</button>
                    <div id="output_trackjobs_"></div>
                </div>
            </main>
        </modal>
    `;

    shadowRoot.appendChild(modal.firstElementChild);

    // Initialize custom select
    const customSelect = shadowRoot.querySelector('.custom-select');
    const selectElement = shadowRoot.querySelector('#actionSelect_trackjobs_');
    const selected = customSelect.querySelector('.select-selected');
    const itemsContainer = customSelect.querySelector('.select-items');

    selected.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('active');
        itemsContainer.classList.toggle('select-hide');
    });

    // biome-ignore lint/complexity/noForEach: <explanation>
    itemsContainer.querySelectorAll('div').forEach(item => {
        item.addEventListener('click', (e) => {
            const value = item.getAttribute('data-value');
            selected.textContent = item.textContent;
            selectElement.value = value;
            
            // Enable/disable the Track Job button based on selection
            const actionButton = shadowRoot.querySelector('#action_trackjobs_');
            actionButton.disabled = !value;
            
            // Trigger change event on the original select
            const event = new Event('change', { bubbles: true });
            selectElement.dispatchEvent(event);
            
            // Update selected item styling
            // biome-ignore lint/complexity/noForEach: <explanation>
            itemsContainer.querySelectorAll('div').forEach(div => {
                div.classList.remove('same-as-selected');
            });
            item.classList.add('same-as-selected');
            
            // Close dropdown
            customSelect.classList.remove('active');
            itemsContainer.classList.add('select-hide');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        customSelect.classList.remove('active');
        itemsContainer.classList.add('select-hide');
    });
    console.log(modalContainer);
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
    chrome.runtime.sendMessage({ action: 'checkAuth' }, (response) => {
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