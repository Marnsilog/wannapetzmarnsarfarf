document.addEventListener("DOMContentLoaded", () => {
    const currentUrl = window.location.pathname;
    const tokenFromUrl = currentUrl.split('/').pop(); 

    if (tokenFromUrl) {
        document.getElementById("token").value = tokenFromUrl; 
        console.log("Token from URL:", tokenFromUrl);
    }

    const form = document.getElementById("resetPasswordForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); 

        const token = document.getElementById("token").value;
        const password = form.elements["password"].value; 

        console.log("Password:", password);
        console.log("Token:", token);
        
        try {
            const response = await fetch("/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }), 
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.href = "/login"; 
            } else {
                alert(data.message); 
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while resetting the password.");
        }
    });
});
