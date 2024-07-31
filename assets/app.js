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
    "/img/sunsetmosque.webp",
    "/img/germanmosque.webp",
    "/img/famousmosque.webp",
    "/img/daymosque.webp"
];

let currentIndex = 0;
const backgroundElement = document.getElementById('background');

function changeBackground() {
    backgroundElement.classList.remove('fade-in');
    backgroundElement.classList.add('fade-out');
    
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % images.length;
        backgroundElement.style.backgroundImage = `url(${images[currentIndex]})`;
        backgroundElement.classList.remove('fade-out');
        backgroundElement.classList.add('fade-in');
    }, 1000); // Correspond à la durée du fondu définie dans le CSS
}

setInterval(changeBackground, 5000); // Change l'image toutes les 5 secondes

document.addEventListener("DOMContentLoaded", function() {
    // Set the current date
    const currentDateElement = document.getElementById('current-date');
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('fr-FR', options);

    const timeLeftElement = document.getElementById('time-left');
    const nextPrayerElement = document.getElementById('next-prayer');

    // Fetch prayer times dynamically
    fetch('https://api.aladhan.com/v1/timingsByCity?city=Feurs&country=France&method=2')
        .then(response => response.json())
        .then(data => {
            const timings = data.data.timings;
            const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            const prayerRow = document.getElementById('prayer-row');

            // Remplir les cellules du tableau avec les horaires de prière
            prayers.forEach((prayer, index) => {
                prayerRow.children[index].textContent = timings[prayer];
            });

            function updateTimeLeft() {
                const now = new Date();
                let nextPrayerName = '';
                let minDifference = Infinity;

                prayers.forEach(prayer => {
                    const time = timings[prayer];
                    const [hour, minute] = time.split(':').map(Number);
                    const prayerTime = new Date(now);
                    prayerTime.setHours(hour, minute, 0, 0);

                    // Ajuster si l'heure de la prière est déjà passée pour aujourd'hui
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
                    timeLeftElement.textContent = "00:00:00";
                    nextPrayerElement.textContent = "N/A";
                }
            }

            setInterval(updateTimeLeft, 1000); // Update every second
        })
        .catch(error => {
            document.getElementById('prayer-times').innerText = 'Erreur lors de la récupération des horaires de prière.';
        });
});




document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const resultsContainer = document.getElementById('results');
    const mapContainer = document.getElementById('map');

    // Vérifiez que le conteneur de la carte a des dimensions valides avant d'initialiser la carte
    if (mapContainer.offsetWidth > 0 && mapContainer.offsetHeight > 0) {
        var map = L.map(mapContainer).setView([45.764043, 4.835659], 13); // Lyon par défaut

        // Ajouter les tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.invalidateSize(); // Assurez-vous que la carte se redimensionne correctement

        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const city = cityInput.value.trim();
            if (city) {
                geocodeCity(city);
            }
        });

        function geocodeCity(city) {
            fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        const { lat, lon } = data[0];
                        map.setView([lat, lon], 13);
                        map.invalidateSize(); // Assurez-vous que la carte se redimensionne correctement après le centrage
                        findMosques(lat, lon);
                    } else {
                        resultsContainer.innerHTML = '<p>Ville non trouvée.</p>';
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    resultsContainer.innerHTML = '<p>Erreur lors de la recherche. Veuillez réessayer plus tard.</p>';
                });
        }

        function findMosques(lat, lon) {
            const radius = 5000; // 5 km
            const query = `[out:json];node[amenity=place_of_worship][religion=muslim](around:${radius},${lat},${lon});out;`;

            fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    displayResults(data.elements);
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    resultsContainer.innerHTML = '<p>Erreur lors de la recherche. Veuillez réessayer plus tard.</p>';
                });
        }

        function displayResults(mosques) {
            resultsContainer.innerHTML = '';
            if (mosques.length === 0) {
                resultsContainer.innerHTML = '<p>Aucune mosquée trouvée.</p>';
            } else {
                mosques.forEach(mosque => {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.innerHTML = `
                        <h3>${mosque.tags.name || 'Mosquée'}</h3>
                        <p>${mosque.tags['addr:street'] || ''} ${mosque.tags['addr:city'] || ''}</p>
                        <button class="locate-button" data-lat="${mosque.lat}" data-lon="${mosque.lon}">Localiser</button>
                    `;
                    resultsContainer.appendChild(div);
                });

                // Ajouter des événements pour les boutons de localisation
                document.querySelectorAll('.locate-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const lat = parseFloat(this.getAttribute('data-lat'));
                        const lon = parseFloat(this.getAttribute('data-lon'));
                        map.setView([lat, lon], 15);
                        map.invalidateSize(); // S'assure que la carte se redimensionne correctement lors de la localisation
                        L.marker([lat, lon]).addTo(map).bindPopup(this.previousElementSibling.previousElementSibling.textContent).openPopup();
                    });
                });
            }
        }
    } else {
        console.error("Le conteneur de la carte n'a pas de dimensions valides.");
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // Références aux éléments
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
        left: document.querySelectorAll('.arrow.bi-arrow-return-left'),
        right: document.querySelectorAll('.arrow.bi-arrow-return-right')
    };

    let currentDate = new Date(); // Suivi de la date actuelle

    // Ajouter les écouteurs d'événements pour les liens de navigation
    Object.keys(links).forEach(view => {
        links[view].addEventListener('click', function(event) {
            event.preventDefault();
            switchView(view);
        });
    });

    // Écouteurs pour les flèches de navigation
    arrows.left.forEach(arrow => arrow.addEventListener('click', function(event) {
        event.preventDefault();
        navigateDate(-1);
    }));

    arrows.right.forEach(arrow => arrow.addEventListener('click', function(event) {
        event.preventDefault();
        navigateDate(1);
    }));

    function switchView(view) {
        // Masquer toutes les vues
        Object.values(views).forEach(view => view.style.display = 'none');
        // Enlever la classe active de tous les liens
        Object.values(links).forEach(link => link.classList.remove('active'));
        
        // Afficher la vue sélectionnée et marquer le lien comme actif
        views[view].style.display = 'block';
        links[view].classList.add('active');
        
        // Gestion spécifique pour chaque vue
        if (view === 'month') {
            generateCalendar();
        } else if (view === 'year') {
            generateYearView();
        } else if (view === 'day') {
            updateDayView();
        }
    }

    function navigateDate(offset) {
        const activeView = document.querySelector('.view.active');
        
        if (activeView === views.month) {
            currentDate.setMonth(currentDate.getMonth() + offset);
            generateCalendar();
        } else if (activeView === views.year) {
            currentDate.setFullYear(currentDate.getFullYear() + offset);
            generateYearView();
        } else if (activeView === views.day) {
            currentDate.setDate(currentDate.getDate() + offset);
            updateDayView();
        }
    }

    function updateDayView() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = currentDate.toLocaleDateString('fr-FR', options);
        // Mettez à jour les horaires de prière pour le jour en cours
    }

    function generateCalendar() {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        document.getElementById('month-title').textContent = monthNames[currentMonth] + ' ' + currentYear;

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
            let status = "incomplete"; // Placeholder, should be dynamic based on real data
            html += `<td class="day-cell ${status}"><span>${day < 10 ? '0' : ''}${day}</span></td>`;
        }

        html += '</tr></tbody></table>';
        document.getElementById('calendar').innerHTML = html;
    }

    function generateYearView() {
        const year = currentDate.getFullYear();
        document.getElementById('year-title').textContent = year;

        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const yearCalendar = document.getElementById('year-calendar');
        yearCalendar.innerHTML = '';

        monthNames.forEach(month => {
            const monthBar = document.createElement('div');
            monthBar.classList.add('month-bar');

            // Exemple de données, remplacer par des données réelles
            const incomplete = document.createElement('span');
            incomplete.classList.add('incomplete');
            const missed = document.createElement('span');
            missed.classList.add('missed');
            const complete = document.createElement('span');
            complete.classList.add('complete');

            monthBar.appendChild(incomplete);
            monthBar.appendChild(missed);
            monthBar.appendChild(complete);

            const monthLabel = document.createElement('div');
            monthLabel.textContent = month;
            monthLabel.style.textAlign = 'center';

            const monthContainer = document.createElement('div');
            monthContainer.appendChild(monthBar);
            monthContainer.appendChild(monthLabel);

            yearCalendar.appendChild(monthContainer);
        });
    }

    // Vue initiale
    switchView('day');
});
