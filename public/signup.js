// Send OTP to the email
document.getElementById('sendOtp').addEventListener('click', async () => {
    const email = document.getElementById('email').value;

    if (!email) {
        alert("Please enter your email first.");
        return;
    }

    try {
        const response = await fetch('/auth/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const result = await response.json();
        if (response.ok) {
            alert("OTP sent to your email.");
        } else {
            alert(`Error: ${result.message}`);
            console.log('Error details:', result);
        }
    } catch (error) {
        console.error('Error during OTP request:', error);
        alert("There was an error sending the OTP. Please try again.");
    }
});

    let otpVerified = false;
// Verify OTP
document.getElementById('verifyOtp').addEventListener('click', async () => {
    const otp = Array.from({ length: 6 }, (_, i) => document.getElementById(`otp${i + 1}`).value).join('');
    const email = document.getElementById('email').value;

    if (otp.length !== 6) {
        alert("Please enter a valid 6-digit OTP.");
        return;
    }

    try {
        const response = await fetch('/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        const result = await response.json();
        if (response.ok) {
            alert("OTP verified. You can now submit the signup form.");
            otpVerified = true;  
            
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
    }
});

// Handle the signup form submission
document.getElementById('signup').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log(otpVerified);

    // Ensure OTP is verified before submitting the form
   

    if (otpVerified !== true) {
        alert("Please verify your OTP before submitting the form.");
        return;
    }

    const formData = new FormData(event.target);
    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            body: formData
        });

        const messageBox = document.getElementById('messageBox');
        const messageContent = document.getElementById('messageContent');
        const closeButton = document.getElementById('closeButton');

        if (response.redirected) {
            window.location.href = response.url; 
            return;
        }

        if (response.ok) {
            const result = await response.json();
            messageContent.textContent = result.message || "User registered successfully!";
            messageBox.style.display = 'block';

            closeButton.addEventListener('click', () => {
                messageBox.style.display = 'none';
                window.location.href = '/login'; 
            }, { once: true });
        } else {
            const errorText = await response.text();
            messageContent.textContent = `Signup failed: ${errorText}`;
            messageBox.style.display = 'block';

            closeButton.addEventListener('click', () => {
                messageBox.style.display = 'none'; 
            }, { once: true });
        }
    } catch (error) {
        const messageBox = document.getElementById('messageBox');
        const messageContent = document.getElementById('messageContent');
        messageContent.textContent = `Error: ${error.message}`;
        messageBox.style.display = 'block';
    }
});

function showAssesment() {
    var assesmentform = document.getElementById('assesmentform');
    var mainform = document.getElementById('mainform');
    assesmentform.style.display = 'block';
    mainform.style.display = 'none';
}
