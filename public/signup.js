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



function showAssesment(){
    var assesmentform = document.getElementById('assesmentform');
    var mainform = document.getElementById('mainform');
    assesmentform.style.display = 'block'; 
    mainform.style.display = 'none'; 
   
}

