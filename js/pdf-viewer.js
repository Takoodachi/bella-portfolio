/* Custom PDF reader (PDF.js) — page nav, zoom, enlarge */
(function () {
  "use strict";

  var viewer = document.querySelector(".pdf-viewer");
  if (!viewer || !window.pdfjsLib) return;

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  var canvas = viewer.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  var stage = viewer.querySelector(".pdf-stage");
  var pageEl = viewer.querySelector("[data-pv-page]");
  var zoomEl = viewer.querySelector("[data-pv-zoom]");
  var expandBtn = viewer.querySelector('[data-pv="expand"]');

  /* data-continuous: every page stacked in one scroll instead of prev/next */
  var continuous = viewer.hasAttribute("data-continuous");
  var pdf = null;
  var pageNum = 1;
  var zoom = 1;
  var rendering = false;
  var pending = false;

  function renderPage(num, cv) {
    return pdf.getPage(num).then(function (p) {
      var base = p.getViewport({ scale: 1 });
      var fit = Math.max((stage.clientWidth - 32) / base.width, 0.2);
      var vp = p.getViewport({ scale: fit * zoom });
      var dpr = window.devicePixelRatio || 1;
      cv.width = Math.floor(vp.width * dpr);
      cv.height = Math.floor(vp.height * dpr);
      cv.style.width = Math.floor(vp.width) + "px";
      cv.style.height = Math.floor(vp.height) + "px";
      return p.render({
        canvasContext: cv === canvas ? ctx : cv.getContext("2d"),
        viewport: vp,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
      }).promise;
    });
  }

  function render() {
    if (!pdf) return;
    if (rendering) { pending = true; return; }
    rendering = true;
    var jobs = continuous
      ? Array.prototype.map.call(stage.querySelectorAll("canvas"), function (cv, i) { return renderPage(i + 1, cv); })
      : [renderPage(pageNum, canvas)];
    function done() {
      rendering = false;
      if (pending) { pending = false; render(); }
    }
    Promise.all(jobs).then(done, done);
    pageEl.textContent = continuous ? pdf.numPages + " pages" : pageNum + " / " + pdf.numPages;
    zoomEl.textContent = Math.round(zoom * 100) + "%";
  }

  pdfjsLib.getDocument(viewer.getAttribute("data-pdf")).promise
    .then(function (doc) {
      pdf = doc;
      for (var i = 2; continuous && i <= pdf.numPages; i++) {
        var cv = canvas.cloneNode();
        cv.setAttribute("aria-label", canvas.getAttribute("aria-label") + ", page " + i);
        stage.appendChild(cv);
      }
      render();
    })
    .catch(function () {
      stage.innerHTML =
        '<p style="padding:2rem;font-size:0.95rem;color:#8d887c">' +
        'This document could not be displayed here — use the download button to read it.</p>';
    });

  /* Reparent to <body> while enlarged so no transformed ancestor can trap the fixed box */
  var homeParent = viewer.parentNode;
  var homeMarker = document.createComment("pdf-viewer-home");
  homeParent.insertBefore(homeMarker, viewer);

  function setEnlarged(on) {
    if (on) {
      document.body.appendChild(viewer);
      zoom = 0.8; /* fit-to-width on a full-screen stage makes the text oversized */
    } else {
      homeParent.insertBefore(viewer, homeMarker.nextSibling);
      zoom = 1; /* zoom is an enlarged-only feature; minimized always shows fit-to-width */
    }
    viewer.classList.toggle("enlarged", on);
    document.body.classList.toggle("pdf-enlarged", on);
    document.body.style.overflow = on ? "hidden" : "";
    expandBtn.textContent = on ? "✕" : "⛶";
    expandBtn.setAttribute("aria-label", on ? "Close enlarged reader" : "Enlarge reader");
    render();
  }

  viewer.addEventListener("click", function (e) {
    var btn = e.target.closest(".pv-btn");
    if (!btn) return;
    var action = btn.getAttribute("data-pv");
    if (action === "prev" && pageNum > 1) { pageNum--; render(); }
    if (action === "next" && pdf && pageNum < pdf.numPages) { pageNum++; render(); }
    if (action === "zoom-in") { zoom = Math.min(zoom * 1.25, 4); render(); }
    if (action === "zoom-out") { zoom = Math.max(zoom / 1.25, 0.5); render(); }
    if (action === "expand") setEnlarged(!viewer.classList.contains("enlarged"));
  });

  document.addEventListener("keydown", function (e) {
    if (!viewer.classList.contains("enlarged")) return;
    if (e.key === "Escape") setEnlarged(false);
    if (continuous) return;
    if (e.key === "ArrowLeft" && pageNum > 1) { pageNum--; render(); }
    if (e.key === "ArrowRight" && pdf && pageNum < pdf.numPages) { pageNum++; render(); }
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });
})();
