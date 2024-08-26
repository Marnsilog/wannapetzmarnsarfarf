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

function showAssesment(){
    var assesmentform = document.getElementById('assesmentform');
    var mainform = document.getElementById('mainform');
    assesmentform.style.display = 'block'; 
    mainform.style.display = 'none'; 
   
}

document.getElementById('assessment').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('/auth/assestmentsub', {
            method: 'POST',
            body: formData
        });

        const messageBox2 = document.getElementById('messageBox2');
        const messageContent = document.getElementById('messageContent');
        const closeButton = document.getElementById('closeButton');

        if (response.ok) {
            messageContent.textContent = "Submitted successfully!";
            messageBox2.classList.remove('hidden');

            closeButton.addEventListener('click', () => {
                const form = document.getElementById('assessment');
                form.reset(); // Clear form fields

                // Hide forms and message box
                document.getElementById('mainform').style.display = 'block';
                document.getElementById('assesmentform').style.display = 'none';
                messageBox2.style.display = 'none';
            }, { once: true }); // Ensure the event listener is added only once
        } else {
            const errorText = await response.text();
            messageContent.textContent = `Submission failed: ${errorText}`;
            messageBox2.classList.remove('hidden');

            closeButton.addEventListener('click', () => {
                messageBox2.classList.add('hidden');
            }, { once: true }); // Ensure the event listener is added only once
        }
    } catch (error) {
        const messageBox = document.getElementById('messageBox');
        const messageContent = document.getElementById('messageContent');
        messageContent.textContent = `Error: ${error.message}`;
        messageBox.classList.remove('hidden');

        const closeButton = document.getElementById('closeButton');
        closeButton.addEventListener('click', () => {
            messageBox.classList.add('hidden');
        }, { once: true }); // Ensure the event listener is added only once
    }
});
