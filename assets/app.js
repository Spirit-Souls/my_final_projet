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