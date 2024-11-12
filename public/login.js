
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

                event.target.reset(); 
                history.replaceState(null, '', result.redirectUrl); 
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
function togglePassword() {
    const passwordField = document.getElementById("password");
    passwordField.type = passwordField.type === "password" ? "text" : "password";
  }

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
    event.preventDefault();

    const email = event.target.email.value;

    try {
        const response = await fetch('/auth/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }) 
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            window.location.href = '/login'; 
        } else {
            alert(data.message)
        }
    } catch (err) {
        
        alert('An error occurred. Please try again later.');
    }
});
