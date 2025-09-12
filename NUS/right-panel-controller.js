// Contenuto finale e definitivo per right-panel-controller.js

document.addEventListener('DOMContentLoaded', () => {
    const triggerButton = document.getElementById('info-trigger-button');
    const infoPanel = document.getElementById('infoPanel');
    
    // Controlliamo che tutti gli elementi e Lenis siano pronti
    if (triggerButton && infoPanel && typeof window.lenis !== 'undefined') {
        
        const updateButtonText = () => {
            const isOpen = infoPanel.classList.contains('is-open');
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                triggerButton.textContent = isOpen ? "−" : "+";
            } else {
                triggerButton.textContent = isOpen ? "Chiudi Info" : "Apri Info";
            }
        };

        // Imposta il testo corretto al caricamento della pagina
        updateButtonText();

        // Aggiungi l'evento per il click sul bottone
        triggerButton.addEventListener('click', () => {
            const isOpen = infoPanel.classList.toggle('is-open');

            // GESTIONE DEFINITIVA DELLO SCROLL DI LENIS
            if (isOpen) {
                // Ferma lo scroll della pagina principale
                window.lenis.stop();
            } else {
                // Riattiva lo scroll della pagina principale
                window.lenis.start();
            }
            
            updateButtonText(); // Aggiorna il testo del bottone
        });

        // Aggiorna il testo se l'utente ridimensiona la finestra
        window.addEventListener('resize', updateButtonText);

    } else {
        console.error("ERRORE CRITICO: Il pannello non può essere inizializzato. Controllare la presenza di #info-trigger-button, #infoPanel e della libreria Lenis.");
    }
});