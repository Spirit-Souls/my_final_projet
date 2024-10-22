import './bootstrap.js';
import './styles/app.css';

console.log('This log comes from assets/app.js - welcome to AssetMapper! 🎉');

const images = [
    "/img/gececamisi.webp",
    "/img/sunsetmosque.webp",
    "/img/germanmosque.webp",
    "/img/famousmosque.webp",
    "/img/daymosque.webp"
];

let currentIndex = 0;
const backgroundElement = document.getElementById('background');

function changeBackground() {
    backgroundElement.classList.replace('fade-in', 'fade-out');
    
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % images.length;
        backgroundElement.style.backgroundImage = `url(${images[currentIndex]})`;
        backgroundElement.classList.replace('fade-out', 'fade-in');
    }, 1000);
}

setInterval(changeBackground, 5000);

document.addEventListener("DOMContentLoaded", function() {
    const currentDateElement = document.getElementById('current-date');
    const timeLeftElement = document.getElementById('time-left');
    const nextPrayerElement = document.getElementById('next-prayer');
    const prayerRow = document.getElementById('prayer-row');
    const links = {
        day: document.getElementById('day-link'),
        month: document.getElementById('month-link'),
        year: document.getElementById('year-link')
    };
    const views = {
        day: document.getElementById('day-view'),
        month: document.getElementById('month-view'),
        year: document.getElementById('year-view')
    };
    const arrows = {
        left: document.querySelector('.arrow.bi-arrow-return-left'),
        right: document.querySelector('.arrow.bi-arrow-return-right')
    };
    let currentDate = new Date();

    function updateCurrentDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = currentDate.toLocaleDateString('fr-FR', options);
    }

    async function fetchPrayerTimes(date) {
        const city = "ankara";
        const dateString = date.toISOString().split('T')[0];
        const todayString = new Date().toISOString().split('T')[0];

        console.log(`Fetching prayer times for ${city} on ${dateString}`);

        if (dateString === todayString) {
            try {
                const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=turkey&method=2&date=${dateString}`);
                const data = await response.json();
                if (data.code === 200) {
                    const timings = data.data.timings;
                    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

                    prayers.forEach((prayer, index) => {
                        prayerRow.children[index].textContent = timings[prayer];
                    });

                    updateTimeLeft(timings);
                } else {
                    throw new Error('Invalid response code from API');
                }
            } catch (error) {
                console.error('Error fetching prayer times:', error);
                document.getElementById('prayer-times').innerText = 'Erreur lors de la récupération des horaires de prière.';
            }
        } else {
            clearPrayerTimes();
        }
    }

    function clearPrayerTimes() {
        [...prayerRow.children].forEach(cell => cell.textContent = '');
        nextPrayerElement.textContent = 'N/A';
        timeLeftElement.textContent = "00:00:00";
    }

    function updateTimeLeft(timings) {
        const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

        function calculateTimeLeft() {
            const now = new Date();
            let nextPrayerName = '';
            let minDifference = Infinity;

            prayers.forEach(prayer => {
                const time = timings[prayer];
                const [hour, minute] = time.split(':').map(Number);
                const prayerTime = new Date(currentDate);
                prayerTime.setHours(hour, minute, 0, 0);

                if (prayerTime < now) {
                    prayerTime.setDate(prayerTime.getDate() + 1);
                }

                const difference = prayerTime - now;
                if (difference < minDifference) {
                    minDifference = difference;
                    nextPrayerName = prayer;
                }
            });

            if (minDifference < Infinity) {
                const hoursLeft = Math.floor(minDifference / (1000 * 60 * 60)).toString().padStart(2, '0');
                const minutesLeft = Math.floor((minDifference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                const secondsLeft = Math.floor((minDifference % (1000 * 60)) / 1000).toString().padStart(2, '0');

                timeLeftElement.textContent = `${hoursLeft}:${minutesLeft}:${secondsLeft}`;
                nextPrayerElement.textContent = nextPrayerName;
            } else {
                clearPrayerTimes();
            }
        }

        calculateTimeLeft();
        setInterval(calculateTimeLeft, 1000);
    }

    function switchView(view) {
        Object.values(views).forEach(v => v.style.display = 'none');
        Object.values(links).forEach(link => link.classList.remove('active'));
        views[view].style.display = 'block';
        links[view].classList.add('active');

        if (view === 'month') {
            generateCalendar();
        } else if (view === 'year') {
            generateYearView();
        } else if (view === 'day') {
            updateDayView();
        }
    }

    function navigateDate(offset) {
        if (views.month.style.display === 'block') {
            currentDate.setMonth(currentDate.getMonth() + offset);
            generateCalendar();
        } else if (views.year.style.display === 'block') {
            currentDate.setFullYear(currentDate.getFullYear() + offset);
            generateYearView();
        } else if (views.day.style.display === 'block') {
            currentDate.setDate(currentDate.getDate() + offset);
            updateDayView();
        }
    }

    function updateDayView() {
        updateCurrentDateDisplay();
        fetchPrayerTimes(currentDate);
    }

    function generateCalendar() {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        let firstDay = new Date(currentYear, currentMonth, 1).getDay();
        firstDay = (firstDay === 0) ? 6 : firstDay - 1;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        document.getElementById('month-title').textContent = `${monthNames[currentMonth]} ${currentYear}`;

        let html = '<table class="calendar-table"><thead><tr>';
        ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].forEach(day => {
            html += `<th>${day}</th>`;
        });
        html += '</tr></thead><tbody><tr>';

        for (let i = 0; i < firstDay; i++) {
            html += '<td class="day-cell empty"></td>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            if ((day + firstDay - 1) % 7 === 0) {
                html += '</tr><tr>';
            }
            html += `<td class="day-cell" data-day="${day}"><span>${day < 10 ? '0' : ''}${day}</span></td>`;
        }

        html += '</tr></tbody></table>';
        document.getElementById('calendar').innerHTML = html;

        document.querySelectorAll('.day-cell').forEach(cell => {
            cell.addEventListener('click', function() {
                const selectedDay = parseInt(this.getAttribute('data-day'), 10);
                currentDate.setDate(selectedDay);
                switchView('day');
            });
        });
    }

    function generateYearView() {
        const year = currentDate.getFullYear();
        document.getElementById('year-title').textContent = year;
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const yearCalendar = document.getElementById('year-calendar');
        yearCalendar.innerHTML = '';

        monthNames.forEach((month, index) => {
            const monthContainer = document.createElement('div');
            monthContainer.classList.add('month-container');

            const monthBar = document.createElement('div');
            monthBar.classList.add('month-bar');
            monthBar.dataset.month = index;
            monthBar.dataset.year = year;

            const incomplete = document.createElement('span');
            incomplete.classList.add('incomplete');
            const missed = document.createElement('span');
            missed.classList.add('missed');
            const complete = document.createElement('span');
            complete.classList.add('complete');
            monthBar.append(incomplete, missed, complete);

            const monthLabel = document.createElement('div');
            monthLabel.textContent = month;
            monthLabel.classList.add('month-label');

            monthContainer.append(monthBar, monthLabel);
            yearCalendar.appendChild(monthContainer);

            monthBar.addEventListener('click', function() {
                currentDate.setMonth(parseInt(this.dataset.month));
                currentDate.setFullYear(parseInt(this.dataset.year));
                switchView('month');
            });
        });
    }

    Object.keys(links).forEach(view => {
        links[view].addEventListener('click', function(event) {
            event.preventDefault();
            switchView(view);
        });
    });

    [arrows.left, arrows.right].forEach(arrow => arrow.addEventListener('click', function(event) {
        event.preventDefault();
        navigateDate(this === arrows.left ? -1 : 1);
    }));

    switchView('day');
});
