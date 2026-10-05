// ============================================================
// AFC Cambridge — in-page PDF newsletter viewer
// Needs pdf.js loaded on the page before this script runs
// (see the <script> tags added to newsletter.html)
// ============================================================

(function () {
    'use strict';
  
    let pdfDoc = null;
    let currentPage = 1;
    let totalPages = 0;
    let rendering = false;
    let pendingPage = null;
  
    const modal = document.getElementById('pdfModal');
    const canvas = document.getElementById('pdfCanvas');
    const statusEl = document.getElementById('pdfStatus');
    const titleEl = document.getElementById('pdfModalTitle');
    const pageInfoEl = document.getElementById('pdfPageInfo');
    const closeBtn = document.getElementById('pdfModalClose');
    const prevBtn = document.getElementById('pdfPrev');
    const nextBtn = document.getElementById('pdfNext');
  
    if (!modal || typeof pdfjsLib === 'undefined') return; // viewer not set up on this page
  
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  
    // Converts a normal Google Drive "share" link into a direct-download link pdf.js can read
    function driveDirectUrl(url) {
      const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (m) return 'https://drive.google.com/uc?export=download&id=' + m[1];
      return url; // not a Drive link — use as-is
    }
  
    window.AFC_openPdfViewer = function (url, title) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      titleEl.textContent = title || '';
      statusEl.textContent = 'Loading…';
      statusEl.style.display = 'block';
      canvas.style.visibility = 'hidden';
      pageInfoEl.textContent = '';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
  
      const directUrl = driveDirectUrl(url);
  
      pdfjsLib.getDocument(directUrl).promise
        .then(function (doc) {
          pdfDoc = doc;
          totalPages = doc.numPages;
          currentPage = 1;
          renderPage(1);
        })
        .catch(function (err) {
          console.error('PDF load error:', err);
          statusEl.innerHTML = "Couldn't load a preview of this issue.<br>" +
            '<a href="' + url + '" target="_blank" rel="noopener" style="color:#b8860b;">Open it directly instead →</a>';
        });
    };
  
    function renderPage(num) {
      if (rendering) { pendingPage = num; return; }
      rendering = true;
      statusEl.style.display = 'block';
      statusEl.textContent = 'Loading…';
  
      pdfDoc.getPage(num).then(function (page) {
        const container = document.querySelector('.pdf-canvas-wrap');
        const maxHeight = window.innerHeight * 0.8;
        const maxWidth = (container && container.clientWidth) || window.innerWidth * 0.9;
  
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(maxWidth / baseViewport.width, maxHeight / baseViewport.height);
        const viewport = page.getViewport({ scale: scale });
  
        canvas.width = viewport.width;
        canvas.height = viewport.height;
  
        const ctx = canvas.getContext('2d');
        page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
          rendering = false;
          statusEl.style.display = 'none';
          canvas.style.visibility = 'visible';
          currentPage = num;
          pageInfoEl.textContent = 'Page ' + currentPage + ' of ' + totalPages;
          prevBtn.disabled = currentPage <= 1;
          nextBtn.disabled = currentPage >= totalPages;
  
          if (pendingPage !== null) {
            const next = pendingPage;
            pendingPage = null;
            renderPage(next);
          }
        });
      });
    }
  
    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      pdfDoc = null;
    }
  
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(); // clicking the dark backdrop closes it
    });
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) renderPage(currentPage - 1);
    });
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages) renderPage(currentPage + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft' && currentPage > 1) renderPage(currentPage - 1);
      if (e.key === 'ArrowRight' && currentPage < totalPages) renderPage(currentPage + 1);
    });
  
  })();