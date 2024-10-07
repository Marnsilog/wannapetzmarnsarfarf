document.addEventListener("DOMContentLoaded", function() {
    const submitButton = document.getElementById("submitButton");
    const messageBox = document.getElementById("messageBox");


    if (submitButton) {
        submitButton.addEventListener("click", function (e) {
            e.preventDefault();
            messageBox.classList.remove("hidden");
            messageBox.classList.add("flex");
        });
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            document.getElementById('messageBoxlogout').classList.remove('hidden');
        });
    }

    const yesLogout = document.getElementById('yeslogout');
    if (yesLogout) {
        yesLogout.addEventListener('click', () => {
            fetch('/auth/logout', {
                method: 'GET'
            }).then(response => {
                if (response.ok) {
                    window.location.href = 'login.html';
                } else {
                    return response.text().then(text => {
                        console.error('Logout failed:', text);
                    });
                }
            }).catch(error => {
                console.error('Error:', error);
            });
        });
    }

    const noLogout = document.getElementById('nologout');
    if (noLogout) {
        noLogout.addEventListener('click', () => {
            document.getElementById('messageBoxlogout').classList.add('hidden');
        });
    }
});
