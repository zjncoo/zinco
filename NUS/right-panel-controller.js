document.addEventListener('DOMContentLoaded', () => {
    const triggerButton = document.getElementById('info-trigger-button');
    const rightPanel = document.getElementById('rightPanel');
    
    if (triggerButton && rightPanel) {
        
        // Funzione per aggiornare il testo del bottone
        const updateButtonText = () => {
            const isOpen = rightPanel.classList.contains('is-open');
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // Su mobile: usa "+" e "-"
                triggerButton.textContent = isOpen ? "−" : "+"; // Ho usato un meno tipografico, più bello
            } else {
                // Su desktop: usa il testo completo
                triggerButton.textContent = isOpen ? "- info" : "+ info";
            }
        };

        // Imposta il testo corretto al caricamento della pagina
        updateButtonText();

        // Aggiungi l'evento per il click
        triggerButton.addEventListener('click', () => {
            rightPanel.classList.toggle('is-open');
            updateButtonText(); // Aggiorna il testo dopo ogni click
        });

        // (Opzionale ma consigliato) Aggiorna il testo se l'utente ridimensiona la finestra
        window.addEventListener('resize', updateButtonText);
    }
});