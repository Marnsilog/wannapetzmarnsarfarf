fetch('/get-username')
.then(response => response.json())
.then(data => {
    document.getElementById('username').textContent = data.username;
});

//Verification
$(document).ready(function () {
    let selectedPetId = null;
    let selectedUsername = null;

    function fetchPets() {
        $.get('/auth/api/pets', function (data) {
            const tbody = $('#petTableBody');
            tbody.empty();

            data.forEach(pet => {
                const imageUrl = pet.image_path ? `/${pet.image_path}` : 'img/logo.png';

                const row = `
                    <tr>
                        <td><div class="flex justify-center"><img src="${imageUrl}" class="object-fill w-32 h-16 p-2"></div></td>
                        <td class="text-base font-semibold">${pet.added_by}</td>
                        <td class="text-base font-semibold">${pet.pet_name}</td>
                        <td class="text-base font-semibold">${pet.adopt_status}</td>
                        <td class="text-base font-semibold">${pet.age}</td>
                        <td class="text-base font-semibold">${pet.pet_type}</td>
                        <td class="text-base font-semibold">${pet.breed}</td>
                        <td>
                            <div class="flex justify-center space-x-5">
                                <button class="w-28 h-7 rounded-lg bg-[#5A93EA] text-white font-inter font-semibold text-base" onclick="handlePetStatus(${pet.pet_id}, '${pet.adopt_status}', '${pet.added_by}')">Approve</button>
                                <button class="w-28 h-7 rounded-lg bg-red-600 text-white font-inter font-semibold text-base" onclick="updateStatus(${pet.pet_id}, 'declined', '${pet.added_by}')">Decline</button>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.append(row);
            });
        }).fail(function () {
            console.error('Error fetching pet data.');
        });
    }

    fetchPets();

    window.handlePetStatus = function (petId, adoptStatus, username) {
        selectedPetId = petId;
        selectedUsername = username;
        selectAdadoptStatus = adoptStatus;
        if (['spayneuter', 'adoption', 'for adoption'].includes(adoptStatus)) {
            $('#addSched').show();
        } else {
            updateStatus(petId, 'approved', username);
        }
    };

    $('#confirmSchedule').on('click', function () {
        const scheduleDate = $('#scheduleDate').val();
        document.getElementById('loading').style.display = 'flex';
        if (scheduleDate) {
            $.ajax({
                url: `/auth/api/pets/${selectedPetId}/status`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ status: 'approved', datetime: scheduleDate, username: selectedUsername, adoptStatus: selectAdadoptStatus }),
                success: function () {
                    $('#addSched').hide();
                    alert('Pet status Approved!'); // Fixed alert function name
                    document.getElementById('loading').style.display = 'none';
                    fetchPets();
                },
                error: function () {
                    document.getElementById('loading').style.display = 'none';
                    console.error('Error updating pet status or schedule');
                }
            });
        } else {
            alert('Please select a date.');
        }
    });

    window.updateStatus = function (petId, status, username) {
        $.ajax({
            url: `/auth/api/pets/${petId}/status`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ status: status, username: username, adoptStatus: adoptStatus }),
            success: function () {
                console.log('Pet status updated successfully');
                fetchPets();
            },
            error: function () {
                console.error('Error updating pet status');
            }
        });
    };
});




// $(document).ready(function () {
//     let selectedPetId = null; 

//     function fetchPets() {
//         $.get('/auth/api/pets', function (data) {
//             const tbody = $('#petTableBody');
//             tbody.empty();

//             data.forEach(pet => {
//                 let imageUrl = '/path/to/default/image.png';
//                 if (pet.image_path) {
//                     imageUrl = `/${pet.image_path}`;
//                 }
//                 let viewFileColumn = '';
//                 if (pet.submitted_file) {
//                     viewFileColumn = `
//                         <td class="text-base font-semibold">
//                             <a href="#" onclick="viewFile('${pet.submitted_file}')" class="underline underline-offset-4">View</a>
//                         </td>`;
//                 } else {
//                     viewFileColumn = '<td></td>';  // Leave blank if no file is submitted
//                 }

//                 const row = `
//                     <tr>
//                         <td>
//                             <div class="flex justify-center">
//                                 <img src="${imageUrl}" class="object-fill w-32 h-16 p-2">
//                             </div>
//                         </td>
//                         <td class="text-base font-semibold">${pet.added_by}</td>
//                         <td class="text-base font-semibold">${pet.pet_name}</td>
//                         <td class="text-base font-semibold">${pet.adopt_status}</td>
//                         <td class="text-base font-semibold">${pet.owner}</td>
//                         <td class="text-base font-semibold">${pet.age}</td>
//                         <td class="text-base font-semibold">${pet.pet_type}</td>
//                         <td class="text-base font-semibold">${pet.breed}</td>
//                         ${viewFileColumn}  <!-- Add the view file column here if applicable -->
//                         <td>
//                             <div class="flex justify-center space-x-5">
//                                 <button class="w-28 h-7 rounded-lg bg-[#5A93EA] text-white font-inter font-semibold text-base" onclick="handlePetStatus(${pet.pet_id}, '${pet.adopt_status}')">Approve</button>
//                                 <button class="w-28 h-7 rounded-lg bg-red-600 text-white font-inter font-semibold text-base" onclick="updateStatus(${pet.pet_id}, 'declined')">Decline</button>
//                             </div>
//                         </td>
//                     </tr>
//                 `;
//                 tbody.append(row);
//             });
//         }).fail(function () {
//             console.error('Error fetching pet data.');
//         });
//     }

//     fetchPets();

//     // Function to display the submitted file (PDF)
//     window.viewFile = function (filePath) {
//         const fileUrl = `/${filePath}`;

//         $('#pdfPreview').attr('src', fileUrl);
//         $('#pdfModal').show();  // Assuming you're using a modal for viewing
//     };

//     // Function to handle Pet Status based on Adopt Status
//     window.handlePetStatus = function (petId, adoptStatus) {
//         if (adoptStatus === 'spayneuter' || adoptStatus === 'adoption') {
//             selectedPetId = petId;
//             $('#addSched').show();  
//         } else {
//             updateStatus(petId, 'approved');
//         }
//     };

//     // Confirm schedule and update datetime
//     $('#confirmSchedule').on('click', function () {
//         const scheduleDate = $('#scheduleDate').val();

//         if (scheduleDate) {
//             $.ajax({
//                 url: `/auth/api/pets/${selectedPetId}/status`,
//                 type: 'PUT',
//                 contentType: 'application/json',
//                 data: JSON.stringify({ status: 'approved', datetime: scheduleDate }),
//                 success: function () {
//                     console.log('Pet status and schedule updated successfully');
//                     $('#addSched').hide();  // Hide the modal after confirmation
//                     fetchPets();
//                 },
//                 error: function () {
//                     console.error('Error updating pet status or schedule');
//                 }
//             });
//         } else {
//             alert('Please select a date.');
//         }
//     });

//     // Function to handle updating status
//     window.updateStatus = function (petId, status) {
//         $.ajax({
//             url: `/auth/api/pets/${petId}/status`,
//             type: 'PUT',
//             contentType: 'application/json',
//             data: JSON.stringify({ status: status }),
//             success: function () {
//                 console.log('Pet status updated successfully');
//                 fetchPets();
//             },
//             error: function () {
//                 console.error('Error updating pet status');
//             }
//         });
//     };
// });




//PET STATUS COUNT 
fetch('/auth/getCount')
    .then(response => response.json())
    .then(data => {
        document.getElementById('spayneuter').innerText = data.spayNeuterCount;
        document.getElementById('adoption').innerText = data.adoptionCount;
        document.getElementById('overall').innerText = data.overallCount;
    })
    .catch(error => console.error('Error fetching counts:', error));


//ADMIN HISTORY!!
$(document).ready(function() {
    function fetchPets() {
        $.get('/auth/api/pethistory', function(data) {
           // console.log(data);
            data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

            const tbody = $('#petHistory');
            tbody.empty(); 

            data.forEach(pet => {
                // Helper function to handle null values
                function formatValue(value) {
                    return value !== null ? value : '';
                }

                let imageUrl = '/savedpic/default-image.png';
                if (pet.image_path) {
                    imageUrl = `/${pet.image_path}`; 
                }

                let statusBgColor = '';
                let statusText = '';
                let borderClass = '';
                
                if (pet.status) {
                    const status = pet.status.toLowerCase();
                    switch (status) {
                        case 'approved':
                            statusBgColor = 'bg-green-600';
                            statusText = 'Approved';
                            borderClass = 'border-[1px] border-black';
                            break;
                        case 'declined':
                            statusBgColor = 'bg-red-600';
                            statusText = 'Declined';
                            borderClass = 'border-[1px] border-black';
                            break;
                        case 'pending':
                            statusBgColor = 'bg-[#F9CC59]';
                            statusText = 'Pending';
                            borderClass = 'border-[1px] border-black'; 
                            break;
                        default:
                            statusText = ''; 
                            break;
                    }
                }
                
                const row = `
                    <tr class="text-center font-Inter border-black border-b-2">
                        <td>
                            <div class="flex justify-center">
                                <img src="${imageUrl}" class="object-fill w-32 h-16 p-2">
                            </div>
                        </td>
                        <td class="text-xl font-semibold">${formatValue(pet.pet_name)}</td>
                        <td class="text-xl font-semibold">${formatValue(pet.adopt_status)}</td>
                        <td class="text-xl font-semibold">${formatValue(pet.added_by)}</td>
                        <td>
                            <div class="flex justify-center">
                                <div class="w-32 h-10 ${borderClass} ${statusBgColor} py-[5px]">
                                    <p class="text-center font-inter font-bold text-lg text-white">${statusText}</p>
                                </div>
                            </div>
                        </td>
                        <td class="text-base font-semibold">${new Date(formatValue(pet.datetime)).toLocaleString()}</td>
                    </tr>
                `;
                
                tbody.append(row);
            });
        }).fail(function() {
            console.error('Error fetching pet data.');
        });
    }

    fetchPets();
});


//monitoring
$(document).ready(function() {
    function fetchPets() {
        $.get('/auth/api/alladminadoptionAproved', function(data) {
            //console.log(data);

            data.sort((a, b) => {
                const dateA = new Date(a.video_date); 
                const dateB = new Date(b.video_date);
                return dateB - dateA; 
            });

            const months = [
                "January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"
            ];
            const tbody = $('#petMonitoring');
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
                let videoUrl = '/savedvideo/default-vid.mp4'; 
                if (pet.video_path) {
                    videoUrl = `/${pet.video_path}`; 
                }
                

                const row = `
                     <tr class="text-center font-Inter border-black border-b-2">
                                    <td>
                                        <div class="flex justify-center">
                                            <img src="${imageUrl}" class="object-fill w-32 h-16">
                                        </div>
                                        
                                    </td>
                                    <td class="text-xl font-semibold">${pet.pet_name || ''}</td>
                                    <td class="text-xl font-semibold">${month}</td>
                                    <td>
                                        <div class="flex justify-center">
                                            <div class="w-auto h-auto border-[1px] border-black bg-gray-400 py-2 rounded-lg">
                                                <div class="max-w-72 text-center text-sm font-inter font-bold text-black rounded-lg break-words">${videoUrl}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="flex justify-center">
                                            ${videoUrl !== '/savedvideo/default-vid.mp4' ? 
                                    `<button class="bg-[#03A9F4] text-white font-inter font-semibold w-28 rounded-lg border-[1px] border-black h-10 play-video-btn" data-video-path="${videoUrl}">Play</button>` : 
                                    '<p>No file uploaded</p>'
                                }
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

//USER VIEW
$(document).ready(function() {
    function fetchUsers() {
        $.get('/auth/api/getalluser', function(data) {
           // console.log(data);
            data.sort((a, b) => new Date(b.datetime || 0) - new Date(a.datetime || 0));

            const tbody = $('#userView');
            tbody.empty(); 

            data.forEach(user => {
                const row = `
                    <tr class="text-center font-Inter border-black border-b-2">
                        <td class="text-base font-semibold h-12">${user.user_id}</td>
                        <td class="text-base font-semibold h-12">${user.username}</td>
                        <td class="text-base font-semibold h-12">${user.name}</td>
                        <td class="text-base font-semibold h-12">${user.lastname}</td>
                        <td class="text-base font-semibold h-12">${user.location}</td>
                        <td class="text-base font-semibold h-12">${user.email}</td>
                    </tr>
                `;

                tbody.append(row);
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching user data:', textStatus, errorThrown);
            //alert('Failed to fetch user data. Please try again later.');
        });
    }

    fetchUsers();
});

//Assesment View
$(document).ready(function() {
    function fetchUsers() {
        $.get('/auth/getallAssesment', function(data) {
            console.log(data);
            data.sort((a, b) => new Date(b.datetime || 0) - new Date(a.datetime || 0));

            const tbody = $('#assesmentView');
            tbody.empty(); 

            data.forEach(user => {
                const row = `
                    <tr class="text-center font-Inter border-black border-b-2">
                        <td class="text-base font-semibold h-12">${user.name}</td>
                        <td class="text-base font-semibold h-12">${user.address}</td>
                        <td class="text-base font-semibold h-12">${user.age}</td>
                        <td class="text-base font-semibold h-12">${user.nationality}</td>
                        <td class="text-base font-semibold h-12">${user.phonenumber}</td>
                        <td class="text-base font-semibold h-12">${user.occupation}</td>
                    </tr>
                `;

                tbody.append(row);
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching user data:', textStatus, errorThrown);
            //alert('Failed to fetch user data. Please try again later.');
        });
    }

    fetchUsers();
});

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
        document.querySelector('#profile [data-field="contactnumber"]').textContent = data.contactnumber || 'N/A';
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

function showMenu() {
    const responsive_menu = document.getElementById('responsive_menu');
    if (responsive_menu.style.display === 'none' || responsive_menu.style.display === '') {
        responsive_menu.style.display = 'block'; 
    } else {
        responsive_menu.style.display = 'none';
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
    const contactNumber = document.getElementById('editContactNumber').value;
    const gender = document.querySelector('input[name="editGender"]:checked').value;
    const profilePicture = document.getElementById('editProfilePicture').files[0];

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('address', address);
    formData.append('contactNumber', contactNumber);
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
