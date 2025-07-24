document.addEventListener('DOMContentLoaded', () => {
    
    // --- DATABASE DEI PROGETTI ---
    // Aggiungi qui i tuoi nuovi progetti
    const progetti = [
        {
            title: 'webp converter',
            description: 'converts images into webp images.',
            link: 'webp/converter.html',
            imageUrl: 'imghome/webp-preview.png', // Sostituisci con un'immagine di anteprima
            category: 'tool'
        },
        {
            title: 'card generator',
            description: 'fedelity card generator.',
            link: 'cardgenerator.html',
            imageUrl: 'imghome/card-preview.png', // Sostituisci con un'immagine di anteprima
            category: 'generator'
        },
        {
            title: 'webm converter',
            description: 'fedelity card generator.',
            link: 'webm.html',
            imageUrl: 'imghome/card-preview.png', // Sostituisci con un'immagine di anteprima
            category: 'tool'
        }
        // Esempio di un altro progetto
        // {
        //     title: 'Nuovo Progetto',
        //     description: 'Descrizione del nuovo progetto.',
        //     link: 'path/to/project.html',
        //     imageUrl: 'path/to/image.png',
        //     category: 'Categoria'
        // }
    ];

    const gridContainer = document.getElementById('project-grid-container');

    if (gridContainer) {
        progetti.forEach(progetto => {
            const projectCard = document.createElement('a');
            projectCard.href = progetto.link;
            projectCard.classList.add('project-card', 'cursor-target');

            projectCard.innerHTML = `
                <div class="card-image-container">
                    <img src="${progetto.imageUrl}" alt="Anteprima di ${progetto.title}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3>${progetto.title}</h3>
                    <p>${progetto.description}</p>
                    <span class="card-category">${progetto.category}</span>
                </div>
            `;
            
            gridContainer.appendChild(projectCard);
        });
    }
});