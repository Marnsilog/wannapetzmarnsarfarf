function displaySection(sectionName) {
    const sections = ['frmdashboard', 'frmAdoptpet','frmSpay', 'frmAdoptHistory','frmPetMonitoring','frmScheduling'];

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

function adoptpet() {
    displaySection('frmAdoptpet');
    document.getElementById('menuname').textContent = 'Adopt a pet';
}

function spayneuter() {
    displaySection('frmSpay');
    document.getElementById('menuname').textContent = 'Spay/Neuter';
}


function adopthis() {
    displaySection('frmAdoptHistory');
    document.getElementById('menuname').textContent = 'Adopt History';
}

function monitoring() {
    displaySection('frmPetMonitoring');
    document.getElementById('menuname').textContent = 'Pet Monitoring';
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

$(document).ready(function() {
    function base64ArrayBuffer(arrayBuffer) {
        let base64 = '';
        const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        const bytes = new Uint8Array(arrayBuffer);
        const byteLength = bytes.byteLength;
        const byteRemainder = byteLength % 3;
        const mainLength = byteLength - byteRemainder;

        let a, b, c, d;
        let chunk;

        for (let i = 0; i < mainLength; i += 3) {
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

            a = (chunk & 16515072) >> 18;
            b = (chunk & 258048) >> 12;
            c = (chunk & 4032) >> 6;
            d = chunk & 63;

            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }

        if (byteRemainder === 1) {
            chunk = bytes[mainLength];

            a = (chunk & 252) >> 2;
            b = (chunk & 3) << 4;

            base64 += encodings[a] + encodings[b] + '==';
        } else if (byteRemainder === 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

            a = (chunk & 64512) >> 10;
            b = (chunk & 1008) >> 4;
            c = (chunk & 15) << 2;

            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }

        return base64;
    }

    function fetchPets(petType = '') {
        const url = petType ? `/api/allpets?type=${petType}` : '/api/allpets';

        $.get(url, function(data) {
            console.log(data);

            const container = $('#container');
            container.empty();

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

                const petElement = `
                    <div class="w-full h-[20rem] border-b-2 border-black">
                        <div class="w-full flex justify-normal px-32 space-y-5">
                            <img src="${imageUrl}" class="object-fill h-56 w-72 mt-10">
                            <div class="w-[40%] font-inter text-gray-500 text-lg ml-14 mt-2">
                                <p class="font-bold text-xl">Breed: <span class="font-semibold text-lg" id="breed">${pet.breed}</span></p>
                                <p class="font-bold text-xl">Age: <span class="font-semibold text-lg" id="age">${pet.age}</span></p>
                                <p class="font-bold text-xl">Gender: <span class="font-semibold text-lg" id="gender">${pet.gender}</span></p>
                                <p class="font-bold text-xl">Owner: <span class="font-semibold text-lg" id="owner">${pet.owner}</span></p>
                                <p class="font-bold text-xl">Location: <span class="font-semibold text-lg" id="location">${pet.location}</span></p>
                                <p class="font-bold text-xl">Contact Number: <span class="font-semibold text-lg" id="contactnumber">${pet.contact_number}</span></p>
                                <p class="font-bold text-xl">Type: <span class="font-semibold text-lg" id="type">${pet.pet_type}</span></p>
                                <p class="font-bold text-xl">Email: <span class="font-semibold text-lg" id="Email">${pet.email}</span></p>
                            </div>
                            <div>
                                <button class="mt-24 w-56 h-12 bg-[#5A93EA] text-white text-xl font-Inter font-semibold rounded-lg adopt-button" data-pet-id="${pet.id}">Adopt this pet</button>
                            </div>
                        </div>
                    </div>
                `;
                container.append(petElement);
            });

            $('.adopt-button').click(function() {
                const petId = $(this).data('pet-id');
                window.location.href = `/client_adoption?petId=${petId}`;
            });
        }).fail(function() {
            console.error('Error fetching pet data.');
        });
    }

    $('#petTypeFilter').change(function() {
        const selectedType = $(this).val();
        fetchPets(selectedType);
    });

    // Initial fetch with no filter
    fetchPets();
});


$(document).ready(function() {
    // Fetch pet data from the server
    function fetchPets() {
        $.get('/api/allclientpets', function(data) {
            console.log('Pet data:', data); // Debug log

            const tbody = $('#petclientHistory');
            tbody.empty(); 

            data.forEach(pet => {
                let imageUrl = 'path/to/default/image.png'; // Default image path

                // Check if pet image exists and process it
                if (pet.pet_image) {
                    try {
                        const binaryData = new Uint8Array(pet.pet_image.data);
                        imageUrl = `data:image/jpeg;base64,${arrayBufferToBase64(binaryData.buffer)}`;
                    } catch (e) {
                        console.error('Error processing image data:', e);
                    }
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
                                <img src="${imageUrl}" class="object-fill w-32 h-16 px-2 py-2">
                            </div>
                        </td>
                        <td class="text-xl font-semibold">${pet.pet_type}</td>
                        <td class="text-xl font-semibold">${pet.pet_name}</td>
                        <td>
                            <div class="flex justify-center">
                                <div class="w-32 h-12 border-[1px] border-black ${statusBgColor} py-2">
                                    <p class="text-center font-inter font-bold text-lg text-white">${pet.status}</p>
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

    // Convert ArrayBuffer to base64 string
    function arrayBufferToBase64(arrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // Call fetchPets function on page load
    fetchPets();
});


// Base64 Array Buffer Function







