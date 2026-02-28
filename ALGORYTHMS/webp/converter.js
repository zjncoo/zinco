document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');

    // Apre la finestra di dialogo per la selezione dei file evitando loop
    uploadArea.addEventListener('click', (e) => {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });

    // Gestione del drag & drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Gestione della selezione file tramite click
    fileInput.addEventListener('change', () => {
        const files = fileInput.files;
        handleFiles(files);
        fileInput.value = ''; // Resetta per permettere di caricare lo stesso file
    });

    const handleFiles = (files) => {
        // Ora la funzione non svuota più i risultati precedenti

        // Controlla se ci sono file
        if (!files || files.length === 0) {
            alert("No file selected.");
            return;
        }

        // Processa ogni file
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                console.warn(`${file.name} is not an image and will be ignored.`);
                return;
            }
            convertImageToWebP(file);
        });
    };

    const convertImageToWebP = (file) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Converte l'immagine in WebP
                canvas.toBlob((blob) => {
                    const webpUrl = URL.createObjectURL(blob);
                    const originalSize = (file.size / 1024).toFixed(1);
                    const newSize = (blob.size / 1024).toFixed(1);

                    // Crea l'elemento di anteprima e download
                    const previewItem = document.createElement('div');
                    previewItem.classList.add('preview-item');

                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

                    previewItem.innerHTML = `
                        <img src="${webpUrl}" alt="Preview of ${newFileName}">
                        <div class="info">
                            <strong>${newFileName}</strong><br>
                            (${originalSize} KB → ${newSize} KB)
                        </div>
                        <a href="${webpUrl}" download="${newFileName}" class="download-btn cursor-target">Download</a>
                    `;

                    previewContainer.appendChild(previewItem);

                }, 'image/webp', 0.9); // 0.9 è la qualità (da 0 a 1)
            };
            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
    };
});