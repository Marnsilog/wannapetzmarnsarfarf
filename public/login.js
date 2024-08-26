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
