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