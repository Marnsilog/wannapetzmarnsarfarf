function setMaxDateForBirthday(inputId, yearsBack) {
    const birthdayInput = document.getElementById(inputId);
    const today = new Date();
    const maxDate = new Date();

    // Calculate the date specified years back
    maxDate.setFullYear(today.getFullYear() - yearsBack);

    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(maxDate.getDate()).padStart(2, '0');

    birthdayInput.max = `${year}-${month}-${day}`; 
}
// function validateInput(input) {
//     // Remove any non-numeric characters
//     input.value = input.value.replace(/\D/g, '');
//   }

function calculateAge() {
    const birthdayInput = document.getElementById('birthday');
    const ageInput = document.getElementById('age');
    const birthday = new Date(birthdayInput.value);
    const today = new Date();

    // Calculate age in years and months
    let years = today.getFullYear() - birthday.getFullYear();
    let months = today.getMonth() - birthday.getMonth();

    // Adjust for negative months
    if (months < 0) {
        years--;
        months += 12;
    }

    // Set the age in the age input field
    if (years > 0) {
        ageInput.value = `${years} years ${months} months`;
    } else {
        ageInput.value = `${months} months`;
    }
}


  function validateBirthday() {
    const birthdayInput = document.getElementById('birthday');
    const today = new Date();
    const selectedDate = new Date(birthdayInput.value);

    // Check if the input is valid
    if (isNaN(selectedDate)) {
        birthdayInput.setCustomValidity("Please enter a valid date.");
        return;
    }

    // Calculate the maximum date (today)
    const maxDate = new Date(); // Current date

    // Calculate the minimum date (11 years ago)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 11); // Set to 11 years ago

    const isTooYoung = selectedDate > maxDate; // Should not be in the future
    const isTooOld = selectedDate < minDate;   // Must be younger than or equal to 11 years

    if (isTooYoung) {
        birthdayInput.setCustomValidity("The date cannot be in the future.");
    } else if (isTooOld) {
        birthdayInput.setCustomValidity("Pets cannot be older than 11 years.");
    } else {
        birthdayInput.setCustomValidity(""); 
    }
}

function setDateLimits(inputId) {
    const birthdayInput = document.getElementById(inputId);

    // Set the maximum date to today
    const maxDate = new Date();
    birthdayInput.max = maxDate.toISOString().split('T')[0];

    // Set the minimum date to 11 years ago
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 11);
    birthdayInput.min = minDate.toISOString().split('T')[0];
}

setDateLimits('birthday');

function removeNumbers(event) {
    const input = event.target;
    input.value = input.value.replace(/[0-9]/g, '');
}

function validateEmail(event) {
const input = event.target;
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

if (!emailPattern.test(input.value)) {
    input.setCustomValidity("Please enter a valid email address.");
} else {
    input.setCustomValidity(""); 
}
}

function validateContactNumber(event) {
const input = event.target;
const value = input.value;

const numericValue = value.replace(/[^0-9+]/g, '');
input.value = numericValue;
const isValidPhilippineNumber = /^(09\d{9}|\+639\d{9})$/.test(numericValue);
if (numericValue && !isValidPhilippineNumber) {
    input.setCustomValidity("Please enter a valid Philippine contact number (09XXXXXXXXX or +639XXXXXXXXX).");
} else {
    input.setCustomValidity(""); 
}
}

// function validateYearsInService() {
//     const input = document.getElementById('EditYearsInService');
//     input.value = input.value.replace(/[^0-9]/g, '');
// }

document.getElementById('editProfile').addEventListener('submit', function (event) {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('ConfirmPassword').value;

        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

        if (!newPassword.match(passwordRegex)) {
            alert('New password must be at least 8 characters long, contain at least one number, and one special character.');
            event.preventDefault(); 
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match.');
            event.preventDefault();
            return;
        }
    
});

document.getElementById('adoptForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    
    try {
        const response = await fetch(this.action, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const message = await response.text();
            alert(message);
            this.reset(); 
        } else {
            const errorMessage = await response.text();
            alert('Error: ' + errorMessage);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.'); 
    }
});