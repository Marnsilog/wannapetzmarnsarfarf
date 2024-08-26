document.getElementById('signup').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            body: formData
        });

        const messageBox = document.getElementById('messageBox');
        const messageContent = document.getElementById('messageContent');
        const closeButton = document.getElementById('closeButton');

        if (response.ok) {
            messageContent.textContent = "User registered successfully!";
        } else {
            const errorText = await response.text();
            messageContent.textContent = `Signup failed: ${errorText}`;
        }
        
        messageBox.classList.remove('hidden'); 

        closeButton.addEventListener('click', () => {
            if (response.ok) {
                window.location.href = '/login'; 
            } else {
                messageBox.classList.add('hidden');
            }
        });
    } catch (error) {
        const messageBox = document.getElementById('messageBox');
        const messageContent = document.getElementById('messageContent');
        messageContent.textContent = `Error: ${error.message}`;
        messageBox.classList.remove('hidden');
    }
});
