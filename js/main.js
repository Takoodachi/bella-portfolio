/* Bella Duong — Portfolio interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Page enter transition ---------- */
  document.body.classList.add("is-entering");
  window.addEventListener("animationend", function (e) {
    if (e.target.classList && e.target.classList.contains("page-veil")) {
      document.body.classList.remove("is-entering");
    }
  });

  /* Exit transition on internal navigation */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") ||
        a.target === "_blank" || href.startsWith("http") || reduceMotion) return;
    e.preventDefault();
    document.body.classList.add("is-exiting");
    setTimeout(function () { window.location.href = href; }, 420);
  });

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", document.body.classList.contains("nav-open"));
    });
    document.querySelectorAll(".nav-overlay a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal, .line-mask");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* Auto-stagger siblings marked with data-stagger on the parent */
  document.querySelectorAll("[data-stagger]").forEach(function (parent) {
    var step = parseFloat(parent.getAttribute("data-stagger")) || 0.08;
    Array.prototype.forEach.call(parent.children, function (child, i) {
      child.style.setProperty("--delay", (i * step).toFixed(2) + "s");
    });
  });

  /* ---------- Hero slideshow ---------- */
  var slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1) {
    var dotsWrap = document.querySelector(".hero-dots");
    var current = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      if (!dotsWrap) return;
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Slide " + (i + 1));
      if (i === 0) b.classList.add("active");
      b.addEventListener("click", function () { show(i); restart(); });
      dotsWrap.appendChild(b);
    });

    function show(i) {
      slides[current].classList.remove("active");
      if (dotsWrap) dotsWrap.children[current].classList.remove("active");
      current = i % slides.length;
      slides[current].classList.add("active");
      if (dotsWrap) dotsWrap.children[current].classList.add("active");
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { show(current + 1); }, 6000);
    }
    show(0);
    if (!reduceMotion) restart();
  }

  /* ---------- Hero parallax ---------- */
  var heroMedia = document.querySelector(".hero-slides");
  if (heroMedia && !reduceMotion) {
    var latest = 0, ticking = false;
    window.addEventListener("scroll", function () {
      latest = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(function () {
          heroMedia.style.transform = "translateY(" + latest * 0.28 + "px)";
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Custom cursor ---------- */
  if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    var dot = document.createElement("div");
    var ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add("has-custom-cursor");

    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + (mx - 4) + "px," + (my - 4) + "px)";
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + (rx - ring.offsetWidth / 2) + "px," + (ry - ring.offsetHeight / 2) + "px)";
      requestAnimationFrame(loop);
    })();

    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button, .polaroid, .g-item, .video-ph")) {
        document.body.classList.add("cursor-hover");
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button, .polaroid, .g-item, .video-ph")) {
        document.body.classList.remove("cursor-hover");
      }
    });
  }

  /* ---------- Expandable pieces ---------- */
  document.querySelectorAll(".expandable").forEach(function (piece) {
    var btn = piece.querySelector(".read-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = piece.classList.toggle("open");
      btn.childNodes[0].nodeValue = open ? "Close " : "Read the full piece ";
      if (!open) {
        piece.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  /* ---------- Sub-nav active state ---------- */
  var subnavLinks = document.querySelectorAll(".subnav a[href^='#']");
  if (subnavLinks.length && "IntersectionObserver" in window) {
    var sections = [];
    subnavLinks.forEach(function (a) {
      var sec = document.querySelector(a.getAttribute("href"));
      if (sec) sections.push({ a: a, sec: sec });
    });
    var subIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          sections.forEach(function (s) {
            s.a.classList.toggle("active", s.sec === entry.target);
          });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(function (s) { subIO.observe(s.sec); });
  }

  /* ---------- Lightbox ---------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (galleryItems.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<img alt="Enlarged photograph">' +
      '<button class="lb-close" aria-label="Close">✕</button>' +
      '<button class="lb-prev" aria-label="Previous">←</button>' +
      '<button class="lb-next" aria-label="Next">→</button>' +
      '<div class="lb-count"></div>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector("img");
    var lbCount = lb.querySelector(".lb-count");
    var idx = 0;

    function openLB(i) {
      idx = (i + galleryItems.length) % galleryItems.length;
      var item = galleryItems[idx];
      lbImg.src = item.getAttribute("data-lightbox") || item.querySelector("img").src;
      lbCount.textContent = (idx + 1) + " / " + galleryItems.length;
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeLB() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }

    galleryItems.forEach(function (item, i) {
      item.addEventListener("click", function () { openLB(i); });
    });
    lb.querySelector(".lb-close").addEventListener("click", closeLB);
    lb.querySelector(".lb-prev").addEventListener("click", function () { openLB(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { openLB(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLB(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLB();
      if (e.key === "ArrowLeft") openLB(idx - 1);
      if (e.key === "ArrowRight") openLB(idx + 1);
    });
  }

  /* ---------- Random polaroid rotation ---------- */
  document.querySelectorAll(".polaroid").forEach(function (p, i) {
    var r = (i % 2 === 0 ? 1 : -1) * (2 + Math.random() * 4);
    p.style.setProperty("--rot", r.toFixed(1) + "deg");
  });
})();
