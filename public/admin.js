function displaySection(sectionName) {
    const sections = ['frmdashboard', 'frmVerification','frmAdoptHis', 'frmPetmonitoring','frmScheduling' ];

    sections.forEach(section => {

        const element = document.getElementById(section);
        if (section === sectionName) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }

    });
}

function home() {
    displaySection('frmdashboard');
    document.getElementById('menuname').textContent = 'Dashboard';
    
}

function verification() {
    displaySection('frmVerification');
    document.getElementById('menuname').textContent = 'Verification';
}

function adopthistory() {
    displaySection('frmAdoptHis');
    document.getElementById('menuname').textContent = 'Adopt History';
}


function monitoring() {
    displaySection('frmPetmonitoring');
    document.getElementById('menuname').textContent = 'Monitoring';
}

function scheduling() {
    displaySection('frmScheduling');
    document.getElementById('menuname').textContent = 'Scheduling';
}

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

function base64ArrayBuffer(arrayBuffer) {
    var base64 = '';
    var bytes = new Uint8Array(arrayBuffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i += 512) {
        base64 += String.fromCharCode.apply(null, bytes.subarray(i, i + 512));
    }
    return window.btoa(base64);
}

$(document).ready(function() {
    function fetchPets() {
        $.get('/api/pets', function(data) {
            console.log(data);

            const tbody = $('#petTableBody');
            tbody.empty(); 

            data.forEach(pet => {
                console.log(pet); 

                let imageUrl = 'path/to/default/image.png';

                if (pet.pet_image) {
                    try {
                        const binaryData = new Uint8Array(pet.pet_image.data);
                        imageUrl = `data:image/jpeg;base64,${base64ArrayBuffer(binaryData.buffer)}`;
                    } catch (e) {
                        console.error('Error processing image data:', e);
                    }
                }

                const row = `
                    <tr>
                        <td>
                            <div class="flex justify-center">
                                <img src="${imageUrl}" class="object-fill w-32 h-16 px-2 py-2">
                            </div>
                        </td>
                        <td class="text-xl font-semibold">${pet.pet_name}</td>
                        <td>
                            <div class="flex justify-center space-x-5">
                                <button class="w-28 h-7 rounded-lg bg-[#5A93EA] text-white font-inter font-semibold text-base" onclick="updateStatus(${pet.id}, 'approved')">Approve</button>
                                <button class="w-28 h-7 rounded-lg bg-red-600 text-white font-inter font-semibold text-base" onclick="updateStatus(${pet.id}, 'declined')">Decline</button>
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
            url: `/api/pets/${petId}/status`,
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
        $.get('/api/allpets', function(data) {
            console.log(data);

            const tbody = $('#petHistory');
            tbody.empty(); 

            data.forEach(pet => {
                let imageUrl = 'path/to/default/image.png';

                if (pet.pet_image) {
                    try {
                        const binaryData = new Uint8Array(pet.pet_image.data);
                        imageUrl = `data:image/jpeg;base64,${base64ArrayBuffer(binaryData.buffer)}`;
                    } catch (e) {
                        console.error('Error processing image data:', e);
                    }
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
                                <img src="${imageUrl}" class="object-fill w-32 h-16">
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


