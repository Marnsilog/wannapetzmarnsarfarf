document.addEventListener("DOMContentLoaded", function() {
    const submitButton = document.getElementById("submitButton");
    const messageBox = document.getElementById("messageBox");
    const yesButton = document.getElementById("yes");
    const noButton = document.getElementById("no");
    const form = document.getElementById("adoptForm");

    if (submitButton) {
        submitButton.addEventListener("click", function (e) {
            e.preventDefault();
            messageBox.classList.remove("hidden");
            messageBox.classList.add("flex");
        });
    }

    if (yesButton) {
        yesButton.addEventListener("click", function () {
            form.submit();
        });
    }

    if (noButton) {
        noButton.addEventListener("click", function () {
            messageBox.classList.add("hidden");
            messageBox.classList.remove("flex");
        });
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            document.getElementById('messageBoxlogout').classList.remove('hidden');
        });
    }
    const logoutButton2 = document.getElementById('logout-button2');
    if (logoutButton2) {
        logoutButton2.addEventListener('click', () => {
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
