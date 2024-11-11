
fetch('/get-username')
.then(response => response.json())
.then(data => {
    document.getElementById('username').textContent = data.username;
});
document.addEventListener('DOMContentLoaded', () => {
    const profilePic = document.getElementById('profile-pic');

    function fetchProfilePic() {
        fetch('/auth/api/userprof')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    profilePic.src = data.profilePicPath;
                } else {
                    console.error('Failed to fetch profile picture:', data.message);
                }
            })
            .catch(error => console.error('Error fetching profile picture:', error));
    }
    fetchProfilePic();
});

document.addEventListener('DOMContentLoaded', () => {
    const profilePic = document.getElementById('profile-pic2');

    function fetchProfilePic() {
        fetch('/auth/api/userprof')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    profilePic.src = data.profilePicPath;
                } else {
                    console.error('Failed to fetch profile picture:', data.message);
                }
            })
            .catch(error => console.error('Error fetching profile picture:', error));
    }
    fetchProfilePic();
});
$(document).ready(function () {
    function showMessageBox() {
        $('#mb_adoption').removeClass('hidden');
    }
    function hideMessageBox() {
        $('#mb_adoption').addClass('hidden'); 
    }
    $('#submitAdoption').click(function (event) {
        event.preventDefault();
        showMessageBox(); 
    });
    $('#adopt_yes').click(function () {
        hideMessageBox();
        $('#adoptionForm').submit();
    });
    $('#adopt_no').click(function () {
        hideMessageBox();
    });
});

window.addEventListener('popstate', (event) => {
    window.location.href = '/client_dashboard'; 
});


/// CLIENT_ADOPT A PET
$(document).ready(function() {
    function fetchPets(petType = '') {
        const url = petType ? `/auth/api/allapprovedpets?type=${petType}` : '/auth/api/allapprovedpets';

        $.get(url, function(data) {
            //console.log(data);

            const container = $('#container');
            container.empty();

            data.forEach(pet => {
                let imageUrl = '/savedpic/default-image.png'; // Default image path

                if (pet.image_path) {
                    imageUrl = `/${pet.image_path}`; // Path from the database
                }

                const petElement = `
                 <div class="w-full md:h-[20rem] border-b-2 border-black py-5 md:py-0 px-1 md:px-0">
                                <div class="w-full md:flex md:justify-normal md:px-32">
                                   <div class="w-full flex justify-normal pl-5 md:pl-0 md:px-32 md:space-y-5">
                                    <img src="${imageUrl}" class="object-fill w-24 h-16 md:h-56 md:w-72 mt-20 md:mt-10">
                                    <div class="w-full md:w-[50%] font-inter text-gray-500 md:text-lg ml-8 pt-10">
                                        <p class="font-bold text-base md:text-xl">Name: <span class="font-semibold text-sm md:text-lg">${pet.pet_name}</span></p>
                                        <p class="font-bold text-base md:text-xl">Breed: <span class="font-semibold text-sm md:text-lg">${pet.breed}</span></p>
                                        <p class="font-bold text-base md:text-xl">Age: <span class="font-semibold text-sm md:text-lg">${pet.age}</span></p>
                                        <p class="font-bold text-base md:text-xl">Gender: <span class="font-semibold text-sm md:text-lg">${pet.gender}</span></p>
                                        <p class="font-bold text-base md:text-xl">Location: <span class="font-semibold text-sm md:text-lg">${pet.location}</span></p>
                                        <p class="font-bold text-base md:text-xl">Type: <span class="font-semibold text-sm md:text-lg">${pet.pet_type}</span></p>
                                    </div>
                                   </div>
                                    <div class="flex justify-center">
                                        <button class="md:mt-24 w-32 py-2 h-10 mt-5 md:w-56 md:h-12 bg-[#5A93EA] text-white text-sm md:text-xl font-Inter font-semibold rounded-lg adopt-button" data-pet-id="${pet.pet_id}">Adopt this pet</button>
                                    </div>
                                </div>
                            </div>
                
                   
                `;
                container.append(petElement);
            });

            $('.adopt-button').click(function() {
                const petId = $(this).data('pet-id');

                // Send adoption request to the server
                $.ajax({
                    url: '/auth/api/adoptPet',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ petId }),
                    success: function(response) {
                        alert(response.message);
                        location.reload();
                    },
                    error: function(xhr) {
                        alert(`Error: ${xhr.responseJSON?.message || 'Adoption failed'}`);
                    }
                });
            });
        }).fail(function() {
            console.error('Error fetching pet data.');
        });
    }

    $('#petTypeFilter').change(function() {
        const selectedType = $(this).val();
        fetchPets(selectedType);
    });

    fetchPets();
});

// $(document).ready(function() {
//     function fetchPets(petType = '') {
//         const url = petType ? `/auth/api/allapprovedpets?type=${petType}` : '/auth/api/allapprovedpets';

//         $.get(url, function(data) {
//             console.log(data);

//             const container = $('#container');
//             container.empty();

//             data.forEach(pet => {
//                 let imageUrl = '/savedpic/default-image.png'; // Default image path

//                 if (pet.image_path) {
//                     imageUrl = `/${pet.image_path}`; // Path from the database
//                 }

//                 const petElement = `
//                     <div class="w-full h-[20rem] border-b-2 border-black">
//                         <div class="w-full flex justify-normal px-32 space-y-5">
//                             <img src="${imageUrl}" class="object-fill h-56 w-72 mt-10">
//                             <div class="w-[40%] font-inter text-gray-500 text-lg ml-14 mt-2">
//                                 <p class="font-bold text-xl">Breed: <span class="font-semibold text-lg">${pet.breed}</span></p>
//                                 <p class="font-bold text-xl">Age: <span class="font-semibold text-lg">${pet.age}</span></p>
//                                 <p class="font-bold text-xl">Gender: <span class="font-semibold text-lg">${pet.gender}</span></p>
//                                 <p class="font-bold text-xl">Owner: <span class="font-semibold text-lg">${pet.owner}</span></p>
//                                 <p class="font-bold text-xl">Location: <span class="font-semibold text-lg">${pet.location}</span></p>
//                                 <p class="font-bold text-xl">Contact Number: <span class="font-semibold text-lg">${pet.contact_number}</span></p>
//                                 <p class="font-bold text-xl">Type: <span class="font-semibold text-lg">${pet.pet_type}</span></p>
//                                 <p class="font-bold text-xl">Email: <span class="font-semibold text-lg">${pet.email}</span></p>
//                             </div>
//                             <div>
//                                 <button class="mt-24 w-56 h-12 bg-[#5A93EA] text-white text-xl font-Inter font-semibold rounded-lg adopt-button" data-pet-id="${pet.pet_id}">Adopt this pet</button>
//                             </div>
//                         </div>
//                     </div>
//                 `;
//                 container.append(petElement);
//             });

//             $('.adopt-button').click(function() {
//                 const petId = $(this).data('pet-id');
//                 window.location.href = `/client_adoption?petId=${petId}`;
//             });
//         }).fail(function() {
//             console.error('Error fetching pet data.');
//         });
//     }

//     $('#petTypeFilter').change(function() {
//         const selectedType = $(this).val();
//         fetchPets(selectedType);
//     });

//     if (window.location.pathname === '/client_adoption') {
//         const urlParams = new URLSearchParams(window.location.search);
//         const petId = urlParams.get('petId');
//         if (petId) {
//             document.getElementById('petId').value = petId;
//         }
//     }

//     fetchPets();
// });

$(document).ready(function() {
    function fetchPets() {
        $.get('/auth/api/allclientpets', function(data) {
            //console.log('Pet data:', data); // Debug log

            const tbody = $('#petclientHistory');
            tbody.empty(); 

            data.forEach(pet => {
                let imageUrl = '/savedpic/default-image.png'; // Default image path

                // Check if pet image exists and process it
                if (pet.image_path) {
                    imageUrl = `/${pet.image_path}`; // Path from the database
                }

                // Determine background color based on pet status
                let statusBgColor;
                switch (pet.status.toLowerCase()) {
                    case 'approved':
                        statusBgColor = 'bg-green-600';
                        break;
                    case 'declined':
                        statusBgColor = 'bg-red-600';
                        break;
                    case 'processing':
                    default:
                        statusBgColor = 'bg-[#F9CC59]';
                        break;
                }

                // Construct a new row for the table
                const row = `
                    <tr class="text-center font-Inter border-black border-b-2">
                        <td>
                            <div class="flex justify-center">
                                <img src="${imageUrl}" class="object-fill w-24 h-10 md:w-32 md:h-16 p-2" alt="Pet Image">
                            </div>
                        </td>
                        <td class="text-base md:text-xl font-semibold">${pet.pet_type}</td>
                        <td class="text-base md:text-xl font-semibold">${pet.pet_name}</td>
                        <td class="text-base md:text-xl font-semibold">${pet.adopt_status}</td>
                        <td>
                            <div class="flex justify-center">
                                <div class="md:w-32 w-24 md:h-10  border-[1px] border-black ${statusBgColor} py-2">
                                    <p class="text-center font-inter font-bold text-base md:text-xl">${pet.status}</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.append(row);
            });
        }).fail(function() {
            console.error('Error fetching pet data.');
        });
    }

    // Call fetchPets function on page load
    fetchPets();
});
// client upload vid
$(document).ready(function() {
    function fetchPets() {
        $.get('/auth/api/alladoptionAproved', function(data) {
            //console.log(data);

            // Sort pets by video_date in descending order
            data.sort((a, b) => {
                const dateA = new Date(a.video_date); 
                const dateB = new Date(b.video_date);
                return dateB - dateA; 
            });

            const months = [
                "January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"
            ];
            const tbody = $('#petHistory');
            tbody.empty();

            data.forEach(pet => {
                let imageUrl = '/savedpic/default-image.png';
                if (pet.image_path) {
                    imageUrl = `/${pet.image_path}`;
                }

                let statusBgColor;
                switch (pet.status ? pet.status.toLowerCase() : '') {
                    case 'approved':
                        statusBgColor = 'bg-green-600';
                        break;
                    case 'declined':
                        statusBgColor = 'bg-red-600';
                        break;
                    case 'processing':
                    default:
                        statusBgColor = 'bg-[#F9CC59]';
                        break;
                }

                const date = pet.video_date ? new Date(pet.video_date) : null;
                const month = date ? months[date.getMonth()] : '';
                let videoUrl = '/savedvideo/default-vid.mp4'; // Default video path
                if (pet.video_path) {
                    videoUrl = `/${pet.video_path}`; // Ensure this is correct
                }
                

                const row = `
                    <tr class="text-center font-Inter border-black border-b-2">
                        <td>
                            <div class="flex justify-center">
                                <img src="${imageUrl}" class="object-fill w-24 h-10 md:w-32 md:h-16 p-2">
                            </div>
                        </td>
                        <td class="text-base md:text-xl font-semibold">${pet.pet_type || ''}</td>
                        <td class="text-base md:text-xl font-semibold">${pet.pet_name || ''}</td>
                        <td class="text-base md:text-xl font-semibold">${month}</td>
                        <td>
                            <div class="flex justify-center">
                                ${videoUrl !== '/savedvideo/default-vid.mp4' ? 
                                    `<button class="bg-[#03A9F4] text-white font-inter font-semibold w-28 rounded-lg border-[1px] border-black h-10 play-video-btn" data-video-path="${videoUrl}">Play</button>` : 
                                    '<p>No file uploaded</p>'
                                }
                            </div>
                        </td>
                        <td>
                            <div class="flex justify-center">
                                <video class="w-[103px] h-10" controls src="${videoUrl}"></video>
                                <input class="w-[103px] h-10 pl-1 mt-2 text-center font-inter font-bold text-sm text-black rounded-lg" 
                                    type="file" accept="video/*" data-pet-id="${pet.pet_id}" onchange="uploadVideo(event)">

                            </div>
                        </td>
                    </tr>
                `;
                tbody.append(row);
            });

            $('.play-video-btn').click(function() {
                const videoPath = $(this).data('video-path');
                $('#videoPlayer').attr('src', videoPath);
                $('#videoOverlay').removeClass('hidden');
            });

            $('#closeVideoOverlay').click(function() {
                $('#videoOverlay').addClass('hidden');
                $('#videoPlayer').removeAttr('src');
            });
        }).fail(function() {
            console.error('Error fetching pet data.');
        });
    }

    fetchPets();
});
function uploadVideo(event) {
    const input = event.target;
    const petId = input.getAttribute('data-pet-id');
    const file = input.files[0];

    if (!file) {
        alert('No file selected.');
        return;
    }

    const formData = new FormData();
    formData.append('pet_id', petId);
    formData.append('formFile', file);

    // Show loading indicator
    document.getElementById('loading').style.display = 'flex';

    $.ajax({
        url: '/auth/api/monitorpet',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            setTimeout(function() {
                // Hide loading indicator after 2 seconds
                document.getElementById('loading').style.display = 'none';
                alert('File uploaded successfully.');
            }, 2000);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            setTimeout(function() {
                // Hide loading indicator after 2 seconds
                document.getElementById('loading').style.display = 'none';
                console.error('Error uploading file:', textStatus, errorThrown);
                alert('Error uploading file.');
            }, 2000);
        }
    });
}
function showMenu() {
    const responsive_menu = document.getElementById('responsive_menu');
    if (responsive_menu.style.display === 'none' || responsive_menu.style.display === '') {
        responsive_menu.style.display = 'block'; 
    } else {
        responsive_menu.style.display = 'none';
    }
}
//profile
function showProfile() {
    fetch('/auth/getUserProf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        document.querySelector('#profile [data-field="firstname"]').textContent = data.name || 'N/A';
        document.querySelector('#profile [data-field="lastname"]').textContent = data.lastname || 'N/A';
        document.querySelector('#profile [data-field="address"]').textContent = data.address || 'N/A';
        document.querySelector('#profile [data-field="gender"]').textContent = data.gender || 'N/A';
        document.querySelector('#profile img').src = data.profile_pic || 'img/user.png';
        document.getElementById('profile').style.display = 'block';
    })
    .catch(error => console.error('Error fetching profile data:', error));
}
function toggleProfile() {
    const profileSection = document.getElementById('profile');
    if (profileSection.style.display === 'none' || profileSection.style.display === '') {
        showProfile();
    } else {
        profileSection.style.display = 'none';
    }
}
function toggleProfile2() {
    const profileSection = document.getElementById('profile');
    if (profileSection.style.display === 'none' || profileSection.style.display === '') {
        showProfile();
    } else {
        profileSection.style.display = 'none';
    }
}
function showeditProf() {
    var mainprofile = document.getElementById('mainprofile');
    var editProfile = document.getElementById('editProfile');
    editProfile.style.display = 'block'; 
    mainprofile.style.display = 'none'; 
}
function Exiteditprof() {
    var mainprofile = document.getElementById('mainprofile');
    var editProfile = document.getElementById('editProfile');
    editProfile.style.display = 'none';  
    mainprofile.style.display = 'block';
}
function submitEditProfile() {
    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    const address = document.getElementById('editAddress').value;
    const gender = document.querySelector('input[name="editGender"]:checked').value;
    const profilePicture = document.getElementById('editProfilePicture').files[0];

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('address', address);
    formData.append('gender', gender);
    if (profilePicture) {
        formData.append('profilePicture', profilePicture);
    }

    fetch('/auth/updateuser', {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profile updated successfully.');
            toggleProfile();
        } else {
            alert('Error updating profile: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));

}












