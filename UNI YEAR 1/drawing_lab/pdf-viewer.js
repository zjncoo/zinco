let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5,
    canvas = document.getElementById('pdfCanvas'),
    ctx = canvas.getContext('2d');

// Inserisci qui il percorso effettivo del tuo file PDF
const url = 'img/booklet.pdf';

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    const renderTask = page.render(renderContext);

    renderTask.promise.then(() => {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });

    document.getElementById('pageNum').textContent = num;
  });
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function onPrevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
  pdfDoc = pdfDoc_;
  document.getElementById('pageCount').textContent = pdfDoc.numPages;
  renderPage(pageNum);
});

document.getElementById('prevPage').addEventListener('click', onPrevPage);
document.getElementById('nextPage').addEventListener('click', onNextPage);