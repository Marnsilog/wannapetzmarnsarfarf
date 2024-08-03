document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const response = await fetch('/signup', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        Toastify({
            text: "User registered successfully! Redirecting to login...",
            duration: 3000,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            backgroundColor: "#4CAF50",
        }).showToast();
        setTimeout(() => {
            window.location.href = '/login'; // Redirect to login page
        }, 3000); // Wait for the toast to finish
    } else {
        const errorText = await response.text();
        Toastify({
            text: `Signup failed: ${errorText}`,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#F44336",
        }).showToast();
    }
});
