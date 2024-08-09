document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const response = await fetch('/signup', {
        method: 'POST',
        body: formData
    });

    const messageBox = document.getElementById('messageBox');
    const messageContent = document.getElementById('messageContent');
    const closeButton = document.getElementById('closeButton');

    if (response.ok) {
        messageContent.textContent = "User registered successfully! Redirecting to login...";
        messageBox.classList.remove('hidden');
        setTimeout(() => {
            window.location.href = '/login'; // Redirect to login page
        }, 3000); // Wait for the message to display
    } else {
        const errorText = await response.text();
        messageContent.textContent = `Signup failed: ${errorText}`;
        messageBox.classList.remove('hidden');
    }

    closeButton.addEventListener('click', () => {
        messageBox.classList.add('hidden');
    });
});
