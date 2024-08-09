

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

/// CLIENT_ADOPT A PET
$(document).ready(function() {
    function fetchPets(petType = '') {
        const url = petType ? `/auth/api/allapprovedpets?type=${petType}` : '/auth/api/allapprovedpets';

        $.get(url, function(data) {
            console.log(data);

            const container = $('#container');
            container.empty();

            data.forEach(pet => {
                let imageUrl = '/savedpic/default-image.png'; // Default image path

                if (pet.image_path) {
                    imageUrl = `/${pet.image_path}`; // Path from the database
                }

                const petElement = `
                    <div class="w-full h-[20rem] border-b-2 border-black">
                        <div class="w-full flex justify-normal px-32 space-y-5">
                            <img src="${imageUrl}" class="object-fill h-56 w-72 mt-10">
                            <div class="w-[40%] font-inter text-gray-500 text-lg ml-14 mt-2">
                                <p class="font-bold text-xl">Breed: <span class="font-semibold text-lg">${pet.breed}</span></p>
                                <p class="font-bold text-xl">Age: <span class="font-semibold text-lg">${pet.age}</span></p>
                                <p class="font-bold text-xl">Gender: <span class="font-semibold text-lg">${pet.gender}</span></p>
                                <p class="font-bold text-xl">Owner: <span class="font-semibold text-lg">${pet.owner}</span></p>
                                <p class="font-bold text-xl">Location: <span class="font-semibold text-lg">${pet.location}</span></p>
                                <p class="font-bold text-xl">Contact Number: <span class="font-semibold text-lg">${pet.contact_number}</span></p>
                                <p class="font-bold text-xl">Type: <span class="font-semibold text-lg">${pet.pet_type}</span></p>
                                <p class="font-bold text-xl">Email: <span class="font-semibold text-lg">${pet.email}</span></p>
                            </div>
                            <div>
                                <button class="mt-24 w-56 h-12 bg-[#5A93EA] text-white text-xl font-Inter font-semibold rounded-lg adopt-button" data-pet-id="${pet.pet_id}">Adopt this pet</button>
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

    if (window.location.pathname === '/client_adoption') {
        const urlParams = new URLSearchParams(window.location.search);
        const petId = urlParams.get('petId');
        if (petId) {
            document.getElementById('petId').value = petId;
        }
    }

    fetchPets();
});


$(document).ready(function() {
    function fetchPets() {
        $.get('/auth/api/allclientpets', function(data) {
            console.log('Pet data:', data); // Debug log

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
                                <img src="${imageUrl}" class="object-fill w-32 h-16 px-2 py-2" alt="Pet Image">
                            </div>
                        </td>
                        <td class="text-xl font-semibold">${pet.pet_type}</td>
                        <td class="text-xl font-semibold">${pet.pet_name}</td>
                        <td class="text-xl font-semibold">${pet.adopt_status}</td>
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

    // Call fetchPets function on page load
    fetchPets();
});











