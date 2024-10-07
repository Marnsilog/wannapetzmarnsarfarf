
// Calendar script
const monthYear = document.getElementById('monthYear');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let scheduledDates = [];

// function fetchScheduledDates() {
//   fetch('/auth/clientsched')
//       .then(response => {
//           if (!response.ok) {
//               return response.json().then(err => { // Get error details
//                   throw new Error(`Error: ${err.error}`);
//               });
//           }
//           return response.json();
//       })
//       .then(data => {
//           if (Array.isArray(data)) {
//               // Extract day from datetime and store in scheduledDates
//               scheduledDates = data.map(item => {
//                   const date = new Date(item.datetime);
//                   return {
//                       day: date.getDate(),
//                       month: date.getMonth(),
//                       year: date.getFullYear(),
//                   };
//               });
//           } else {
//               console.error('Expected an array, but got:', data);
//           }
//           renderCalendar(currentMonth, currentYear);
//       })
//       .catch(error => console.error('Error fetching scheduled dates:', error));
// }

function fetchScheduledDates() {
    fetch('/auth/clientsched')
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { // Get error details
                    throw new Error(`Error: ${err.error}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                // Extract day from datetime and store in scheduledDates
                scheduledDates = data.map(item => {
                    const date = new Date(item.datetime);
  
                    return {
                        day: date.getDate(),
                        month: date.getMonth(),
                        year: date.getFullYear(),
                        purpose: item.adopt_status
                    };
                });
            } else {
                console.error('Expected an array, but got:', data);
            }
            renderCalendar(currentMonth, currentYear);
        })
        .catch(error => console.error('Error fetching scheduled dates:', error));
  }

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

  // Adjust for Monday start (JavaScript default is Sunday=0)
  let startDay = (firstDay === 0) ? 6 : firstDay - 1;

  // Render empty divs for days of the previous month
  for (let i = 0; i < startDay; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.classList.add('p-4', 'text-center', 'border');
      calendarDays.appendChild(emptyDiv);
  }

  // Render the days of the current month
  for (let day = 1; day <= lastDate; day++) {
      const dayDiv = document.createElement('div');
      dayDiv.innerText = day;
      dayDiv.classList.add('p-4', 'text-center', 'border', 'bg-white', 'hover:bg-blue-100');

      // Highlight today
      if (day === currentDate && month === today.getMonth() && year === today.getFullYear()) {
          dayDiv.classList.add('today');
      }

      // Shade the dates that have spayneuter appointments and color them red
      scheduledDates.forEach(date => {
        if(date.purpose === 'spayneuter'){
            if (date.day === day && date.month === month && date.year === year) {
                dayDiv.classList.add('bg-red-500'); 
                dayDiv.innerText += '  spayneuter'; 
            }
        }else if(date.purpose === 'adoption'){
            if (date.day === day && date.month === month && date.year === year) {
                dayDiv.classList.add('bg-red-500'); 
                dayDiv.innerText += '     '; 
                dayDiv.innerText += '     '; 
                dayDiv.innerText += 'adoption'; 
            }
        }
         
      });

      calendarDays.appendChild(dayDiv);
  }
}

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
