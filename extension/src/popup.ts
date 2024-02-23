import axios from "./utils/axios";

console.log('test popup.ts')

const createLoginPage = () => {

    const contentContainer = document.getElementById('content');
    if (!contentContainer) {
        return;
    }

    const loginPage = document.createElement('div');
    const loginButton = document.createElement('button');
    loginButton.innerText = 'Login';
    loginButton.onclick = () => {
        chrome.tabs.create({ url: 'http://localhost:3000' });
    };
    loginPage.appendChild(loginButton);
    
    contentContainer.replaceChildren(loginPage);
}

const createLogoutPage = (email: string) => {
    const contentContainer = document.getElementById('content');
    if (!contentContainer) {
        return;
    }
    contentContainer.replaceChildren();

    const loggedInMessage = document.createElement('p');
    loggedInMessage.innerText = `Logged in as ${email}`;
    contentContainer.appendChild(loggedInMessage);

    const logoutButton = document.createElement('button');
    logoutButton.innerText = 'Logout';
    logoutButton.onclick = () => {
        axios.post('/auth/logout').then(() => {
            createLoginPage()
        });
    };
    contentContainer.appendChild(logoutButton);
}

axios.get('/me').then(response => {
    console.log(response.data);
    createLogoutPage(response.data.email);
}).catch(error => { 
    console.error(error);
    createLoginPage();
});
