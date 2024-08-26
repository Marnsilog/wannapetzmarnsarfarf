// function displaySection(sectionName) {
//     const sections = ['frmdashboard', 'frmVerification','frmAdoptHis', 'frmPetmonitoring','frmScheduling' ];

//     sections.forEach(section => {

//         const element = document.getElementById(section);
//         if (section === sectionName) {
//             element.style.display = 'block';
//         } else {
//             element.style.display = 'none';
//         }

//     });
// }

// function home() {
//     displaySection('frmdashboard');
//     document.getElementById('menuname').textContent = 'Dashboard';
    
// }

// function verification() {
//     displaySection('frmVerification');
//     document.getElementById('menuname').textContent = 'Verification';
// }

// function adopthistory() {
//     displaySection('frmAdoptHis');
//     document.getElementById('menuname').textContent = 'Adopt History';
// }


// function monitoring() {
//     displaySection('frmPetmonitoring');
//     document.getElementById('menuname').textContent = 'Monitoring';
// }

// function scheduling() {
//     displaySection('frmScheduling');
//     document.getElementById('menuname').textContent = 'Scheduling';
// }

fetch('/get-username')
.then(response => response.json())
.then(data => {
    document.getElementById('username').textContent = data.username;
});

document.getElementById('logout-button').addEventListener('click', () => {
fetch('/auth/logout', {
method: 'GET'
}).then(response => {
if (response.ok) {
    window.location.href = '/login';
} else {
    console.error('Logout failed');
}
}).catch(error => console.error('Error:', error));
});

$(document).ready(function() {

    function fetchPets() {
        $.get('/auth/api/pets', function(data) {
            console.log(data);

            const tbody = $('#petTableBody');
            tbody.empty(); 

            data.forEach(pet => {
                console.log(pet); 

                let imageUrl = '/path/to/default/image.png';

                if (pet.image_path) {
                    imageUrl = `/${pet.image_path}`;
                }

                const row = `
                    <tr>
                        <td>
                            <div class="flex justify-center">
                                <img src="${imageUrl}" class="object-fill w-32 h-16 p-2">
                            </div>
                        </td>
                        <td class="text-base font-semibold">${pet.added_by}</td>
                        <td class="text-base font-semibold">${pet.pet_name}</td>
                        <td class="text-base font-semibold">${pet.adopt_status}</td>
                        <td class="text-base font-semibold">${pet.owner}</td>
                        <td class="text-base font-semibold">${pet.age}</td>
                        <td class="text-base font-semibold">${pet.pet_type}</td>
                        <td class="text-base font-semibold">${pet.breed}</td>
                        <td>
                            <div class="flex justify-center space-x-5">
                                <button class="w-28 h-7 rounded-lg bg-[#5A93EA] text-white font-inter font-semibold text-base" onclick="updateStatus(${pet.pet_id}, 'approved')">Approve</button>
                                <button class="w-28 h-7 rounded-lg bg-red-600 text-white font-inter font-semibold text-base" onclick="updateStatus(${pet.pet_id}, 'declined')">Decline</button>
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

    fetchPets();

    window.updateStatus = function(petId, status) {
        $.ajax({
            url: `/auth/api/pets/${petId}/status`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ status: status }),
            success: function() {
                console.log('Pet status updated successfully');
                fetchPets();
            },
            error: function() {
                console.error('Error updating pet status');
            }
        });
    };
});


$(document).ready(function() {
    function fetchPets() {
        $.get('/auth/api/allpets', function(data) {
            console.log(data);

            // Sort data by datetime (most recent first)
            data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

            const tbody = $('#petHistory');
            tbody.empty(); 

            data.forEach(pet => {
                let imageUrl = '/savedpic/default-image.png'; // Default image path

                if (pet.image_path) {
                    imageUrl = `/${pet.image_path}`; // Path from the database
                }

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

                const row = `
                    <tr class="text-center font-Inter border-black border-b-2">
                        <td>
                            <div class="flex justify-center">
                                <img src="${imageUrl}" class="object-fill w-32 h-16 p-2">
                            </div>
                        </td>
                        <td class="text-xl font-semibold">${pet.pet_name}</td>
                        <td class="text-xl font-semibold">${pet.adopt_status}</td>
                        <td class="text-xl font-semibold">${pet.owner}</td>
                        <td>
                            <div class="flex justify-center">
                                <div class="w-32 h-10 border-[1px] border-black ${statusBgColor} py-[5px]">
                                    <p class="text-center font-inter font-bold text-lg text-white">${pet.status}</p>
                                </div>
                            </div>
                        </td>
                        <td class="text-base font-semibold">${new Date(pet.datetime).toLocaleString()}</td>
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
            console.log(data);

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
                                                <div class="text-center text-sm font-inter font-bold text-black rounded-lg break-words">${videoUrl}</div>
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




