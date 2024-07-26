import './bootstrap.js';
/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */
import './styles/app.css';

console.log('This log comes from assets/app.js - welcome to AssetMapper! 🎉');

const images = [
    "/img/gececamisi.webp",
    "/img/daymosque.webp", // Ajoutez les chemins vers vos autres images ici
    "/img/sunsetmosque.webp",
    "/img/germanmosque.webp",
    "/img/famousmosque.webp"
];

let currentIndex = 0;
const backgroundElement = document.getElementById('background'); 
function changeBackground() {
    backgroundElement.classList.add('fade-out');
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % images.length;
        backgroundElement.style.backgroundImage = `url(${images[currentIndex]})`;
        backgroundElement.classList.remove('fade-out');
    }, 1000); // La durée du fondu doit correspondre à celle définie dans le CSS
}

setInterval(changeBackground, 5000); // Change l'image toutes les 5 secondes


document.addEventListener("DOMContentLoaded", function() {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=Paris&country=France&method=2')
        .then(response => response.json())
        .then(data => {
            const timings = data.data.timings;
            const prayerRow = document.getElementById('prayer-row');
            
            prayerRow.innerHTML = ''; // Clear loading text
            
            const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            prayers.forEach(prayer => {
                const cell = document.createElement('td');
                cell.textContent = timings[prayer] || 'N/A';
                prayerRow.appendChild(cell);
            });
        })
        .catch(error => {
            document.getElementById('prayer-times').innerText = 'Erreur lors de la récupération des horaires de prière.';
        });
});
document.addEventListener("DOMContentLoaded", function() {
    // Set the current date
    const currentDateElement = document.getElementById('current-date');
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('fr-FR', options);

    // Simulate data fetching and updating the time left
    // Replace this with actual data fetching logic
    const prayerTimes = {
        Fajr: "03:49",
        Sunrise: "13:52",
        Dhuhr: "18:01",
        Asr: "21:44",
        Maghrib: "23:28",
        Isha: "23:28"
    };
    const prayerRow = document.getElementById('prayer-row');
    const timeLeftElement = document.getElementById('time-left');
    const nextPrayerElement = document.getElementById('next-prayer');

    function updateTimeLeft() {
        const now = new Date();
        let nextPrayerName = '';
        let nextPrayerTime = '';
        let minDifference = Infinity;

        for (const [prayer, time] of Object.entries(prayerTimes)) {
            const [hour, minute] = time.split(':');
            const prayerTime = new Date();
            prayerTime.setHours(hour);
            prayerTime.setMinutes(minute);
            prayerTime.setSeconds(0);

            const difference = prayerTime - now;
            if (difference > 0 && difference < minDifference) {
                minDifference = difference;
                nextPrayerName = prayer;
                nextPrayerTime = prayerTime;
            }
        }

        if (nextPrayerTime) {
            const hoursLeft = Math.floor(minDifference / (1000 * 60 * 60));
            const minutesLeft = Math.floor((minDifference % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((minDifference % (1000 * 60)) / 1000);

            timeLeftElement.textContent = `${hoursLeft}:${minutesLeft}:${secondsLeft}`;
            nextPrayerElement.textContent = nextPrayerName;
        } else {
            timeLeftElement.textContent = "00:00:00";
            nextPrayerElement.textContent = "N/A";
        }
    }

    setInterval(updateTimeLeft, 1000); // Update every second