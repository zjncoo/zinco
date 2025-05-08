const pdfPaths = [
    'img/cover vinile.pdf',
    'img/uv.pdf',
  ];
  
  const container = document.getElementById('pdfThumbContainer');
  
  pdfPaths.forEach(path => {
    const canvas = document.createElement('canvas');
    canvas.classList.add('pdf-thumb');
    container.appendChild(canvas);
  
    const ctx = canvas.getContext('2d');
    const scale = 1.2;
  
    pdfjsLib.getDocument(path).promise.then(pdfDoc => {
      pdfDoc.getPage(1).then(page => {
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
  
        page.render({ canvasContext: ctx, viewport });
      });
    });
  });