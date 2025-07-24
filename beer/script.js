// --- DATABASE DELLE BIRRE ---
// Questo array contiene tutte le informazioni. Puoi aggiungere o modificare oggetti qui.
const beers = [
    {
        id: 1,
        name: 'La Chouffe',
        country: 'Belgio',
        rating: 5,
        price: '€3.50',
        description: 'Birra belga bionda, forte e speziata con note di coriandolo e un leggero sapore fruttato.',
        review: 'Una delle mie preferite in assoluto. Complessa ma beverina, con un finale piacevolmente fruttato. Il tenore alcolico (8%) si nasconde bene.',
        imageUrl: 'https://placehold.co/100x100/ffc107/FFFFFF?text=B'
    },
    {
        id: 2,
        name: 'Punk IPA',
        country: 'Scozia',
        rating: 4,
        price: '€3.00',
        description: 'Una India Pale Ale esplosiva con sentori di frutta tropicale, pompelmo e caramello.',
        review: 'Un classico moderno che non delude mai. L\'amaro è presente ma ben bilanciato dalla base maltata. Ottima per chi si avvicina al mondo delle IPA.',
        imageUrl: 'https://placehold.co/100x100/1E90FF/FFFFFF?text=B'
    },
    {
        id: 3,
        name: 'Weihenstephaner Hefeweissbier',
        country: 'Germania',
        rating: 5,
        price: '€2.80',
        description: 'La più antica birra weizen del mondo. Colore dorato torbido e aroma di banana e chiodi di garofano.',
        review: 'Il punto di riferimento per ogni weizen. Incredibilmente rinfrescante, cremosa e saporita. Perfetta per ogni occasione.',
        imageUrl: 'https://placehold.co/100x100/DAA520/FFFFFF?text=B'
    },
    {
        id: 4,
        name: 'Guinness Draught',
        country: 'Irlanda',
        rating: 4,
        price: '€2.50',
        description: 'Iconica stout irlandese, famosa per la sua schiuma cremosa e il suo colore scuro con riflessi rubino.',
        review: 'Morbida e setosa al palato, con note di caffè tostato e cioccolato. Nonostante l\'aspetto, è sorprendentemente leggera e facile da bere.',
        imageUrl: 'https://placehold.co/100x100/000000/FFFFFF?text=B'
    },
     {
        id: 5,
        name: 'Tipopils',
        country: 'Italia',
        rating: 5,
        price: '€4.00',
        description: 'Pilsner italiana che ha ridefinito lo stile. Chiara, secca e con un amaro erbaceo elegante dato dal dry-hopping.',
        review: 'Una birra che ha fatto scuola in tutto il mondo. Pulita, profumata e incredibilmente dissetante. Un capolavoro di equilibrio.',
        imageUrl: 'https://placehold.co/100x100/008000/FFFFFF?text=B'
    }
];

// --- ELEMENTI DEL DOM ---
const beerListContainer = document.getElementById('beer-list');
const countryFilter = document.getElementById('country-filter');

// --- FUNZIONI ---

/**
 * Genera le stelle (pallini) per la valutazione.
 * @param {number} rating - La valutazione da 1 a 5.
 * @returns {string} L'HTML per i pallini di valutazione.
 */
function createRatingDots(rating) {
    let dotsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const filledClass = i <= rating ? 'filled' : '';
        dotsHtml += `<div class="rating-dot ${filledClass}"></div>`;
    }
    return dotsHtml;
}

/**
 * Mostra le birre nel DOM, filtrando per paese se necessario.
 * @param {string} filter - Il paese selezionato, o 'all' per mostrarle tutte.
 */
function displayBeers(filter = 'all') {
    beerListContainer.innerHTML = ''; // Pulisce la lista prima di ridisegnarla

    const filteredBeers = beers.filter(beer => filter === 'all' || beer.country === filter);

    if (filteredBeers.length === 0) {
        beerListContainer.innerHTML = '<p>Nessuna birra trovata per questo filtro.</p>';
        return;
    }

    filteredBeers.forEach(beer => {
        const beerElement = document.createElement('div');
        beerElement.classList.add('beer-item');
        beerElement.dataset.beerId = beer.id; // Utile per la gestione del click

        beerElement.innerHTML = `
            <div class="beer-summary">
                <img src="${beer.imageUrl}" alt="Foto di ${beer.name}" class="beer-photo">
                <div class="beer-info">
                    <div class="beer-name">${beer.name}</div>
                    <div class="beer-rating">
                        ${createRatingDots(beer.rating)}
                    </div>
                </div>
            </div>
            <div class="beer-details">
                <h3>Descrizione</h3>
                <p>${beer.description}</p>
                <h3>Prezzo Indicativo</h3>
                <p class="price-tag">${beer.price}</p>
                <h3>La mia recensione</h3>
                <p>${beer.review}</p>
            </div>
        `;
        beerListContainer.appendChild(beerElement);
    });
}

/**
 * Popola il menu a tendina dei filtri con i paesi unici presenti nell'array.
 */
function populateFilters() {
    const countries = [...new Set(beers.map(beer => beer.country))];
    countries.sort(); // Ordina i paesi alfabeticamente
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

// --- EVENT LISTENERS ---

// Evento per il cambio di filtro
countryFilter.addEventListener('change', (e) => {
    displayBeers(e.target.value);
});

// Evento per espandere/collassare la recensione (usando event delegation)
beerListContainer.addEventListener('click', (e) => {
    const beerItem = e.target.closest('.beer-item');
    if (beerItem) {
        beerItem.classList.toggle('expanded');
    }
});


// --- INIZIALIZZAZIONE ---
// Al caricamento della pagina, popola i filtri e mostra tutte le birre.
document.addEventListener('DOMContentLoaded', () => {
    populateFilters();
    displayBeers();
});
