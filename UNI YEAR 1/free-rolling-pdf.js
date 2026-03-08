document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("pdf-container");
  if (!container) return;

  // Support single URL or an array of URLs for mixed media
  let urls = [];
  if (window.PDF_URLS && Array.isArray(window.PDF_URLS)) {
    urls = window.PDF_URLS;
  } else if (window.PDF_URL) {
    urls = [window.PDF_URL];
  }

  if (urls.length === 0) return;

  // Set workerSrc for pdf.js wrapper compatibility
  if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  for (const url of urls) {
    const isImage = /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);

    if (isImage) {
      // Handle static images
      const wrapper = document.createElement("div");
      wrapper.className = "pdf-page-wrapper";
      wrapper.style.width = "100%";
      wrapper.style.display = "block";
      wrapper.style.margin = "0";
      wrapper.style.padding = "0";

      const img = document.createElement("img");
      img.src = url;
      img.style.width = "100vw";
      img.style.height = "auto";
      img.style.display = "block";
      img.style.maxWidth = "100%";
      img.loading = "lazy";
      img.decoding = "async";

    } else if (isVideo) {
      // Handle video files
      const wrapper = document.createElement("div");
      wrapper.className = "pdf-page-wrapper";
      wrapper.style.width = "100%";
      wrapper.style.display = "flex";
      wrapper.style.justifyContent = "center";
      wrapper.style.alignItems = "center";
      wrapper.style.margin = "0";
      wrapper.style.padding = "0";
      wrapper.style.backgroundColor = "#fff"; // Ensure white background for letterboxing if needed

      const video = document.createElement("video");
      video.src = url;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.height = "100vh"; // Maximize to screen height
      video.style.width = "auto";   // Adapt width to maintain aspect ratio
      video.style.display = "block";
      video.style.maxWidth = "100%";

      wrapper.appendChild(video);
      container.appendChild(wrapper);

    } else {
      // Handle PDFs
      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const numPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          
          const unscaledViewport = page.getViewport({ scale: 1.0 });
          const targetWidth = window.innerWidth * (window.devicePixelRatio || 1);
          const renderScale = targetWidth / unscaledViewport.width;
          const finalScale = Math.max(1.5, Math.min(renderScale, 5.0));
          const viewport = page.getViewport({ scale: finalScale });

          const wrapper = document.createElement("div");
          wrapper.className = "pdf-page-wrapper";
          wrapper.style.width = "100%";
          wrapper.style.display = "block";
          wrapper.style.margin = "0";
          wrapper.style.padding = "0";

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          canvas.style.width = "100vw";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.style.maxWidth = "100%";

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };

          wrapper.appendChild(canvas);
          container.appendChild(wrapper);

          // Await rendering before continuing to ensure correct sequential order
          await page.render(renderContext).promise;
        }
      } catch (error) {
        console.error("Error loading PDF:", url, error);
      }
    }
  }
});
