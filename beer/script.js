// --- DATABASE DELLE BIRRE (Aggiornato dal sito fattiunabirra.it) ---
const beers = [
    {
        id: 1,
        name: 'Ganjala',
        country: 'Italia',
        rating: 4,
        price: 4.20, // Convertito in numero
        description: 'Birra chiara ad alta fermentazione dal colore dorato e dai riflessi ambrati. Al naso e al palato si percepiscono note agrumate e resinose.',
        review: 'Qui puoi inserire la tua recensione personale...',
        imageUrl: 'https://www.fattiunabirra.it/5243-large_default/ganjala.jpg'
    },
    {
        id: 2,
        name: 'Bibock',
        country: 'Italia',
        rating: 5,
        price: 3.80, // Convertito in numero
        description: 'Birra Bock di colore ambrato carico, con schiuma compatta e persistente. Profumi di malto, caramello e frutta secca.',
        review: 'Qui puoi inserire la tua recensione personale...',
        imageUrl: 'https://www.fattiunabirra.it/5223-large_default/bibock.jpg'
    },
    {
        id: 3,
        name: 'Helles',
        country: 'Germania',
        rating: 4,
        price: 3.30, // Convertito in numero
        description: 'Classica Helles bavarese, birra a bassa fermentazione, colore giallo paglierino, corpo leggero e schiuma fine e compatta.',
        review: 'Qui puoi inserire la tua recensione personale...',
        imageUrl: 'https://www.fattiunabirra.it/5195-large_default/helles.jpg'
    },
    {
        id: 4,
        name: 'Californ-Ipa',
        country: 'Italia',
        rating: 4,
        price: 4.20, // Convertito in numero
        description: 'Una West Coast IPA dal colore dorato carico. Al naso esplodono profumi agrumati e tropicali grazie ai luppoli americani.',
        review: 'Qui puoi inserire la tua recensione personale...',
        imageUrl: 'https://www.fattiunabirra.it/5190-large_default/californ-ipa.jpg'
    },
    {
        id: 5,
        name: 'Blanche de Namur',
        country: 'Belgio',
        rating: 5,
        price: 3.00, // Convertito in numero
        description: 'Birra di frumento belga (Blanche), torbida e leggera. Speziata con coriandolo e scorza d\'arancia amara.',
        review: 'Qui puoi inserire la tua recensione personale...',
        imageUrl: 'https://www.fattiunabirra.it/4862-large_default/blanche-de-namur.jpg'
    }
];

// --- ELEMENTI DEL DOM ---
const beerListContainer = document.getElementById('beer-list');
const countryFilter = document.getElementById('country-filter');
const priceFilter = document.getElementById('price-filter');
const priceValue = document.getElementById('price-value');

// --- FUNZIONI ---

function createRatingDots(rating) {
    let dotsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const filledClass = i <= rating ? 'filled' : '';
        dotsHtml += `<div class="rating-dot ${filledClass}"></div>`;
    }
    return dotsHtml;
}

function displayBeers(country, maxPrice) {
    beerListContainer.innerHTML = '';

    const filteredBeers = beers.filter(beer =>
        (country === 'all' || beer.country === country) &&
        (beer.price <= maxPrice)
    );

    if (filteredBeers.length === 0) {
        beerListContainer.innerHTML = '<p class="no-results">Nessuna birra trovata per questi filtri.</p>';
        return;
    }

    filteredBeers.forEach(beer => {
        const beerElement = document.createElement('div');
        beerElement.classList.add('beer-item');
        beerElement.dataset.beerId = beer.id;

        beerElement.innerHTML = `
            <div class="beer-summary">
                <img src="${beer.imageUrl}" alt="Foto di ${beer.name}" class="beer-photo" onerror="this.style.display='none'">
                <div class="beer-info">
                    <div class="beer-name">${beer.name}</div>
                    <div class="beer-rating">
                        ${createRatingDots(beer.rating)}
                    </div>
                </div>
                <div class="expand-icon"></div>
            </div>
            <div class="beer-details">
                <h3>Descrizione</h3>
                <p>${beer.description}</p>
                <h3>Prezzo Indicativo</h3>
                <p class="price-tag">€${beer.price.toFixed(2).replace('.', ',')}</p>
                <h3>La mia recensione</h3>
                <p>${beer.review}</p>
            </div>
        `;
        beerListContainer.appendChild(beerElement);
    });
}

function populateCountryFilter() {
    const countries = [...new Set(beers.map(beer => beer.country))];
    countries.sort();
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

function setupPriceFilter() {
    if (beers.length === 0) return;
    const maxPrice = Math.ceil(Math.max(...beers.map(b => b.price)));
    priceFilter.max = maxPrice;
    priceFilter.value = maxPrice;
    priceValue.textContent = `€${parseFloat(maxPrice).toFixed(2).replace('.', ',')}`;
}

function updateDisplay() {
    const country = countryFilter.value;
    const price = parseFloat(priceFilter.value);
    displayBeers(country, price);
}

// --- EVENT LISTENERS ---
countryFilter.addEventListener('change', updateDisplay);

priceFilter.addEventListener('input', () => {
    priceValue.textContent = `€${parseFloat(priceFilter.value).toFixed(2).replace('.', ',')}`;
    updateDisplay();
});

beerListContainer.addEventListener('click', (e) => {
    const beerItem = e.target.closest('.beer-item');
    if (beerItem) {
        beerItem.classList.toggle('expanded');
    }
});

// --- INIZIALIZZAZIONE ---
document.addEventListener('DOMContentLoaded', () => {
    populateCountryFilter();
    setupPriceFilter();
    updateDisplay();
});
