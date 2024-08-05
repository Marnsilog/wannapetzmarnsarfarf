function displaySection(sectionName) {
    const sections = ['frmdashboard', 'frmAdoptpet','frmSpay', 'frmAdoptHistory','frmPetMonitoring','frmScheduling'];

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

function adoptpet() {
    displaySection('frmAdoptpet');
    document.getElementById('menuname').textContent = 'Adopt a pet';
}

function spayneuter() {
    displaySection('frmSpay');
    document.getElementById('menuname').textContent = 'Spay/Neuter';
}


function adopthis() {
    displaySection('frmAdoptHistory');
    document.getElementById('menuname').textContent = 'Adopt History';
}

function monitoring() {
    displaySection('frmPetMonitoring');
    document.getElementById('menuname').textContent = 'Pet Monitoring';
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