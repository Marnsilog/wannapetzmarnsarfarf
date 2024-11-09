const monthYear = document.getElementById('monthYear');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let scheduledDates = [];

const modal = document.getElementById('modal');
const modalName = document.getElementById('modalName');
const modalPurpose = document.getElementById('modalPurpose');
const closeModalBtn = document.getElementById('closeModal');

function fetchScheduledDates() {
    fetch('/auth/adminsched')
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(`Error: ${err.error}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                scheduledDates = data.map(item => {
                    const date = new Date(item.datetime);
                    let added_by = '';
                    if (item.adopt_status === 'spayneuter') {
                        added_by = item.added_by;
                    } else if (item.adopt_status === 'adoption') {
                        added_by = item.adoptor_name;
                    }

                    return {
                        day: date.getDate(),
                        month: date.getMonth(),
                        year: date.getFullYear(),
                        added_by: added_by,
                        purpose: item.adopt_status
                    };
                });

                renderCalendar(currentMonth, currentYear);
            } else {
                console.error('Expected an array, but got:', data);
            }
        })
        .catch(error => console.error('Error fetching scheduled dates:', error));
}


// Render the calendar
function renderCalendar(month, year) {
    const firstDay = new Date(year, month).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const currentDate = today.getDate();

    calendarDays.innerHTML = '';
    const monthName = new Date(year, month).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
    });
    monthYear.innerText = monthName;

    let startDay = (firstDay === 0) ? 6 : firstDay - 1;

    for (let i = 0; i < startDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('p-4', 'text-center', 'border');
        calendarDays.appendChild(emptyDiv);
    }

    for (let day = 1; day <= lastDate; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.innerText = day;
        dayDiv.classList.add('p-4', 'text-center', 'border', 'bg-white', 'hover:bg-blue-100');

        if (day === currentDate && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        scheduledDates.forEach(date => {
            if (date.day === day && date.month === month && date.year === year) {
                dayDiv.classList.add('scheduled'); 

                const addedByDiv = document.createElement('div');
                addedByDiv.innerText = `${date.added_by}`;
                addedByDiv.classList.add('text-sm', 'text-gray-700');
                dayDiv.appendChild(addedByDiv);

                // Add click event to show modal with details
                dayDiv.addEventListener('click', () => {
                    showModal(date.added_by, date.purpose);
                });
            }
        });

        calendarDays.appendChild(dayDiv);
    }
}

function showModal(name, purpose) {
    modalName.innerText = `Name: ${name}`;
    modalPurpose.innerText = `Purpose: ${purpose}`;
    modal.style.display = 'block'; // Show modal
}

// Close modal
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none'; // Hide modal
});

// Navigation buttons functionality
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

// Initial fetch and calendar load
fetchScheduledDates();