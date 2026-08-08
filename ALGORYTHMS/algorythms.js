document.addEventListener('DOMContentLoaded', () => {

    // --- DATABASE DEI PROGETTI ---
    // Aggiungi qui i tuoi nuovi progetti
    const progetti = [
        {
            title: 'webp converter',
            description: 'converts images into webp images.',
            link: 'webp/converter.html',
            category: 'tool'
        },
        {
            title: 'card generator',
            description: 'fidelity card generator.',
            link: 'cardgenerator.html',
            category: 'generator'
        },
        {
            title: 'webm converter',
            description: 'convert videos to webm.',
            link: 'webm.html',
            category: 'tool'
        },
        {
            title: 'img resizer',
            description: 'resizes & compresses images to preset dimensions in jpg zip.',
            link: 'imgresizer.html',
            category: 'tool'
        },
        {
            title: 'video compressor',
            description: 'compresses video files directly in browser.',
            link: 'compressor.html',
            category: 'tool'
        }
    ];

    const gridContainer = document.getElementById('project-grid-container');

    if (gridContainer) {
        progetti.forEach(progetto => {
            const projectCard = document.createElement('a');
            projectCard.href = progetto.link;
            projectCard.classList.add('project-card', 'cursor-target');

            projectCard.innerHTML = `
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