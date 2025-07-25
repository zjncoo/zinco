async function main() {
    // --- ELEMENTI DEL DOM ---
    const drinkListContainer = document.getElementById('drink-list');
    const spiritFilter = document.getElementById('spirit-filter');
    const ingredientFiltersContainer = document.getElementById('ingredient-filters');
    const priceFilter = document.getElementById('price-filter');
    const priceValue = document.getElementById('price-value');
    const openFiltersBtn = document.getElementById('open-filters-btn');
    const closeFiltersBtn = document.getElementById('close-filters-btn');
    const filterOverlay = document.getElementById('filter-overlay');
    const searchIconContainer = document.getElementById('search-icon-container');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearchBtn = document.getElementById('close-search-btn');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results');
    const resetFiltersBtn = document.getElementById('reset-filters-btn'); // <-- 1. AGGIUNTO SELETTORE
    
    let drinks = [];

    // --- CARICAMENTO DATI ---
    try {
        const response = await fetch('dranks.json');
        if (!response.ok) throw new Error(`Errore HTTP! Status: ${response.status}`);
        drinks = await response.json();
    } catch (error) {
        console.error("ERRORE: Controlla il file dranks.json:", error);
        if (drinkListContainer) drinkListContainer.innerHTML = '<p class="no-results">Impossibile caricare i drink.</p>';
        return;
    }

    // --- FUNZIONI ---
    function createRatingDots(rating) {
        let dotsHtml = '';
        for (let i = 1; i <= 5; i++) {
            dotsHtml += `<div class="rating-dot ${i <= rating ? 'filled' : ''}"></div>`;
        }
        return dotsHtml;
    }
    
    function displayDrinks(drinksToDisplay, container) {
        if (!container) return;
        container.innerHTML = '';
        if (!drinksToDisplay || drinksToDisplay.length === 0) {
            container.innerHTML = '<p class="no-results">Nessun drink corrisponde ai criteri.</p>';
            return;
        }
        drinksToDisplay.forEach(drink => {
            const drinkElement = document.createElement('div');
            drinkElement.classList.add('drink-item');
            drinkElement.innerHTML = `
                <div class="drink-summary">
                    <img src="${drink.imageUrl}" alt="${drink.name}" class="drink-photo" onerror="this.style.display='none'">
                    <div class="drink-info">
                        <div class="drink-name">${drink.name}</div>
                        <div class="rating-dot-container">${createRatingDots(drink.rating)}</div>
                    </div>
                    <div class="expand-icon"></div>
                </div>
                <div class="drink-details">
                    <h3>Ingredienti</h3><p>${drink.ingredients || 'Non specificati'}</p>
                    <h3>Descrizione</h3><p>${drink.description || 'Non disponibile'}</p>
                    <h3>Procedimento</h3><p>${drink.procedure || 'Non disponibile'}</p>
                </div>`;
            container.appendChild(drinkElement);
        });
    }

    function populateMainFilters() {
        if (!drinks || drinks.length === 0) return;
        const spirits = [...new Set(drinks.map(drink => drink.mainSpirit).filter(Boolean))].sort();
        if (spiritFilter) {
            spiritFilter.innerHTML = '<option value="all">Tutti i distillati</option>';
            spirits.forEach(spirit => spiritFilter.innerHTML += `<option value="${spirit}">${spirit}</option>`);
        }
        const finalIngredients = new Set();
        const alcoholicKeywords = [ 'gin', 'brandy', 'whiskey', 'campari', 'vermouth', 'cognac', 'rum', 'vodka', 'tequila', 'cachaça', 'pisco', 'mezcal', 'calvados', 'applejack', 'fernet-branca', 'chartreuse', 'liquore', 'bitter', 'assenzio', 'vino', 'amaretto', 'cointreau', 'lillet blanc', 'crème', 'triple sec', 'dom bénédictine', 'drambuie', 'punt e mes', 'galliano', 'prosecco', 'champagne', 'midori', 'curaçao', 'falernum', 'pernod', 'sherry' ];
        const ingredientGroups = { 'caffè': 'Caffè', 'menta': 'Menta', 'lime': 'Succo di lime', 'limone': 'Succo di limone', 'arancia': 'Succo di arancia', 'ananas': 'Succo di ananas', 'pompelmo': 'Succo di pompelmo', 'mirtillo': 'Succo di mirtillo', 'orzata': 'Orzata', 'zucchero': 'Zucchero', 'miele': 'Miele', 'zenzero': 'Zenzero', 'granatina': 'Granatina', 'soda': 'Soda', 'cola': 'Cola', 'albume': 'Albume', 'panna': 'Panna' };
        if (ingredientFiltersContainer) {
            drinks.forEach(drink => {
                if (drink.ingredients) {
                    drink.ingredients.split(',').forEach(ingredientString => {
                        const lowerCaseIngredient = ingredientString.toLowerCase().trim();
                        const isAlcoholic = alcoholicKeywords.some(keyword => lowerCaseIngredient.includes(keyword));
                        if (!isAlcoholic && lowerCaseIngredient) {
                            let foundGroup = null;
                            for (const key in ingredientGroups) {
                                if (lowerCaseIngredient.includes(key)) {
                                    foundGroup = ingredientGroups[key];
                                    break;
                                }
                            }
                            if (foundGroup) {
                                finalIngredients.add(foundGroup);
                            }
                        }
                    });
                }
            });
            ingredientFiltersContainer.innerHTML = [...finalIngredients].sort().map(ing => `
                <label class="ingredient-item">
                    <input type="checkbox" value="${ing.toLowerCase()}">
                    <span>${ing}</span>
                </label>
            `).join('');
        }
    }

    function applyMainFilters() {
        const selectedSpirit = spiritFilter.value;
        const maxPrice = parseInt(priceFilter.value, 10);
        const selectedIngredients = Array.from(ingredientFiltersContainer.querySelectorAll('input:checked')).map(cb => cb.value);
        const filteredDrinks = drinks.filter(drink => {
            const spiritMatch = selectedSpirit === 'all' || drink.mainSpirit === selectedSpirit;
            const priceMatch = !drink.price || drink.price <= maxPrice;
            const ingredientsMatch = selectedIngredients.every(reqIng => drink.ingredients && drink.ingredients.toLowerCase().includes(reqIng));
            return spiritMatch && priceMatch && ingredientsMatch;
        });
        displayDrinks(filteredDrinks, drinkListContainer);
    }
    
    function handleSearchInput() {
        const query = searchInput.value.toLowerCase();
        if (query.length < 2) {
            searchResultsContainer.innerHTML = '';
            return;
        }
        const searchResults = drinks.filter(drink => drink.name.toLowerCase().includes(query));
        displayDrinks(searchResults, searchResultsContainer);
    }

    // <-- 2. AGGIUNTA FUNZIONE DI RESET ---
    function resetAllFilters() {
        if (spiritFilter) spiritFilter.selectedIndex = 0;
        if (priceFilter) {
            priceFilter.value = priceFilter.max;
            if (priceValue) priceValue.textContent = `€ ${priceFilter.max}`;
        }
        if (ingredientFiltersContainer) {
            ingredientFiltersContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        }
        applyMainFilters();
    }

    function openOverlay(overlay) { if (overlay) overlay.style.top = "0"; }
    function closeOverlay(overlay) { if (overlay) overlay.style.top = "100%"; }

    // --- COLLEGAMENTO EVENTI ---
    if (openFiltersBtn) openFiltersBtn.addEventListener('click', () => openOverlay(filterOverlay));
    if (closeFiltersBtn) closeFiltersBtn.addEventListener('click', () => closeOverlay(filterOverlay));
    
    if (searchIconContainer) searchIconContainer.addEventListener('click', () => {
        openOverlay(searchOverlay);
        setTimeout(() => searchInput.focus(), 400);
    });
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', () => {
        closeOverlay(searchOverlay);
        searchInput.value = '';
        searchResultsContainer.innerHTML = '';
    });

    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAllFilters); // <-- 3. AGGIUNTO EVENT LISTENER

    if (spiritFilter) spiritFilter.addEventListener('change', applyMainFilters);
    if (priceFilter) {
        priceFilter.addEventListener('input', () => {
            if (priceValue) priceValue.textContent = `€ ${priceFilter.value}`;
            applyMainFilters();
        });
    }
    if (ingredientFiltersContainer) ingredientFiltersContainer.addEventListener('change', e => {
        if (e.target.matches('input[type="checkbox"]')) applyMainFilters();
    });
    if (searchInput) searchInput.addEventListener('input', handleSearchInput);

    document.body.addEventListener('click', e => {
        const summary = e.target.closest('.drink-summary');
        if (summary) {
            const drinkItem = summary.parentElement;
            if (drinkItem) drinkItem.classList.toggle('expanded');
        }
    });

    // --- INIZIALIZZAZIONE ---
    if (priceValue) priceValue.textContent = `€ ${priceFilter.value}`;
    populateMainFilters();
    displayDrinks(drinks.sort((a,b) => a.name.localeCompare(b.name)), drinkListContainer);
    console.log("App pronta.");
}

document.addEventListener('DOMContentLoaded', main);