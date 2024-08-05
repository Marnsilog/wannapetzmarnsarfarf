function displaySection(sectionName) {
    const sections = ['frmdashboard', 'frmVerification','frmAdoptHis', 'frmPetmonitoring','frmScheduling' ];

    sections.forEach(section => {

        const element = document.getElementById(section);
        if (section === sectionName) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }

    });
}

function home() {
    displaySection('frmdashboard');
    document.getElementById('menuname').textContent = 'Dashboard';
    
}

function verification() {
    displaySection('frmVerification');
    document.getElementById('menuname').textContent = 'Verification';
}

function adopthistory() {
    displaySection('frmAdoptHis');
    document.getElementById('menuname').textContent = 'Adopt History';
}


function monitoring() {
    displaySection('frmPetmonitoring');
    document.getElementById('menuname').textContent = 'Monitoring';
}

function scheduling() {
    displaySection('frmScheduling');
    document.getElementById('menuname').textContent = 'Scheduling';
}

fetch('/get-username')
.then(response => response.json())
.then(data => {
    document.getElementById('username').textContent = data.username;
});

document.getElementById('logout-button').addEventListener('click', () => {
fetch('/auth/logout', {
method: 'GET'
}).then(response => {
if (response.ok) {
    window.location.href = '/login';
} else {
    console.error('Logout failed');
}
}).catch(error => console.error('Error:', error));
});