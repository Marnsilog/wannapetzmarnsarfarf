document.getElementById('login').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            body: formData
        });

        const messageBox = document.getElementById('messageBox');
        const messageContent = document.getElementById('messageContent');
        const closeButton = document.getElementById('closeButton');

        if (response.ok) {
            const result = await response.json();
            messageContent.textContent = result.message || "Login successful! Redirecting...";
            messageBox.classList.remove('hidden');
            
            closeButton.addEventListener('click', () => {
                window.location.href = result.redirectUrl;
            });
        } else {
            const errorData = await response.json();
            messageContent.textContent = `Login failed: ${errorData.message || 'Unknown error'}`;
            messageBox.classList.remove('hidden');

            closeButton.addEventListener('click', () => {
                messageBox.classList.add('hidden');
            });
        }
    } catch (error) {
        const messageBox = document.getElementById('messageBox');
        const messageContent = document.getElementById('messageContent');
        messageContent.textContent = `Error: ${error.message}`;
        messageBox.classList.remove('hidden');

        const closeButton = document.getElementById('closeButton');
        closeButton.addEventListener('click', () => {
            messageBox.classList.add('hidden');
        });
    }
});

function forgotPass(){
    var resetForm = document.getElementById('resetForm');
    var LoginForm = document.getElementById('LoginForm');

    resetForm.style.display = 'block'; 
    LoginForm.style.display = 'none'; 
}
function login(){
    var LoginForm = document.getElementById('LoginForm');
    var resetForm = document.getElementById('resetForm');
    LoginForm.style.display = 'block'; 
    resetForm.style.display = 'none'; 
}

document.getElementById('reset-password-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const email = event.target.email.value; // Get the email value

    try {
        const response = await fetch('/auth/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }) // Send email as JSON
        });

        const data = await response.json();

        // Display alert based on the response
        if (response.ok) {
            alert(data.message); // Success message
            window.location.href = '/login'; // Redirect to login
        } else {
            alert(data.message); // Error message
        }
    } catch (err) {
        // Handle network or server errors
        alert('An error occurred. Please try again later.');
    }
});
