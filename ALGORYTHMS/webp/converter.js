// File: ALGORYTHMS/webp/converter.js

document.addEventListener('DOMContentLoaded', () => {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const previewContainer = document.getElementById('preview-container');
  const qualitySelect = document.getElementById('quality-select');
  const batchActions = document.getElementById('batch-actions');
  const btnDownloadAll = document.getElementById('btn-download-all');
  const btnClearAll = document.getElementById('btn-clear-all');

  const ARROW_SVG = '<svg class="custom-arrow-icon" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><line x1="1.5" y1="8.5" x2="8.5" y2="1.5"></line><polyline points="3.5 1.5 8.5 1.5 8.5 6.5"></polyline></svg>';

  const convertedBlobs = [];

  // Click to open file dialog
  uploadArea.addEventListener('click', (e) => {
    if (e.target !== fileInput) {
      fileInput.click();
    }
  });

  // Accessible keyboard support for dropzone
  uploadArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  // Drag & Drop
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
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  });

  // File Input selection
  fileInput.addEventListener('change', () => {
    if (fileInput.files) {
      handleFiles(fileInput.files);
      fileInput.value = '';
    }
  });

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        console.warn(`File "${file.name}" is not an image and was ignored.`);
        return;
      }
      convertImageToWebP(file);
    });
  };

  const convertImageToWebP = (file) => {
    const quality = parseFloat(qualitySelect ? qualitySelect.value : 0.85) || 0.85;
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('Failed to encode image to WebP');
              return;
            }

            const webpUrl = URL.createObjectURL(blob);
            const originalKb = (file.size / 1024).toFixed(1);
            const webpKb = (blob.size / 1024).toFixed(1);
            const diffPct = Math.round(((file.size - blob.size) / file.size) * 100);
            const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';

            convertedBlobs.push({ name: newFileName, url: webpUrl, blob });
            if (batchActions) batchActions.style.display = 'flex';

            const card = document.createElement('article');
            card.className = 'preview-item';

            const badgeHtml =
              diffPct > 0
                ? `<span class="preview-badge-saved">-${diffPct}%</span>`
                : `<span class="preview-badge-saved">+${Math.abs(diffPct)}%</span>`;

            card.innerHTML = `
              <div class="preview-thumb-box">
                <img src="${webpUrl}" alt="Converted preview of ${newFileName}">
                ${badgeHtml}
              </div>
              <div class="preview-meta">
                <span class="preview-filename" title="${newFileName}">${newFileName}</span>
                <div class="preview-stats-row">
                  <span>${img.naturalWidth || img.width} × ${img.naturalHeight || img.height}px</span>
                  <span class="size-after">${originalKb} KB → ${webpKb} KB</span>
                </div>
              </div>
              <a href="${webpUrl}" download="${newFileName}" class="preview-download-btn cursor-target">
                <span>Download .webp</span>
                ${ARROW_SVG}
              </a>
            `;

            previewContainer.prepend(card);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => {
        console.error('Failed to load image file:', file.name);
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  // Download All Files Sequentially
  if (btnDownloadAll) {
    btnDownloadAll.addEventListener('click', () => {
      if (convertedBlobs.length === 0) return;
      convertedBlobs.forEach((item, index) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = item.url;
          a.download = item.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, index * 200);
      });
    });
  }

  // Clear All
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      convertedBlobs.forEach((item) => URL.revokeObjectURL(item.url));
      convertedBlobs.length = 0;
      previewContainer.innerHTML = '';
      if (batchActions) batchActions.style.display = 'none';
    });
  }
});