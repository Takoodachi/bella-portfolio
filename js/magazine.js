/* Magazine flip-book: flows the article into fixed-size pages, then binds
   pages into leaves that turn around the spine. */
(function () {
  "use strict";

  var mag = document.querySelector("[data-mag]");
  if (!mag) return;

  var stage = mag.querySelector(".mag-stage");
  var scaler = mag.querySelector(".mag-scale");
  var book = mag.querySelector(".mag-book");
  var flow = book.querySelector(".mag-flow");
  var cover = book.querySelector(".mag-cover");
  var end = book.querySelector(".mag-end");
  var prev = mag.querySelector('[data-mag="prev"]');
  var next = mag.querySelector('[data-mag="next"]');
  var label = mag.querySelector("[data-mag-label]");
  var flowHTML = flow.innerHTML;
  var wide = window.matchMedia("(min-width: 900px)");

  /* Pages are laid out at a fixed pixel size and scaled as a whole, so the
     page breaks are identical on every screen. */
  var SIZES = { spread: [460, 595], single: [340, 440] };
  var spread, pageW, pageH, total, leaves = [], cur = 0, settle;

  function sizePage(p) {
    p.style.width = pageW + "px";
    p.style.height = pageH + "px";
  }

  function newPage(num) {
    var p = document.createElement("section");
    p.className = "mag-page gen";
    p.innerHTML = '<div class="mag-run"><span>Spring 2026 · <em>The Governor’s Review</em></span>' +
      "<span>" + num + '</span></div><div class="mag-cols"></div>';
    sizePage(p);
    book.appendChild(p);
    return p;
  }

  function overflows(el) {
    return el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
  }

  /* Start offsets of every word after the first, across nested text nodes. */
  function boundaries(p) {
    var out = [], walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), t, m, re = /\s+/g;
    while ((t = walker.nextNode())) {
      re.lastIndex = 0;
      while ((m = re.exec(t.data))) {
        if (m.index + m[0].length < t.data.length) out.push([t, m.index + m[0].length]);
      }
    }
    return out;
  }

  /* Keep the first `words` words in p; return the rest as a continuation paragraph. */
  function split(p, words) {
    var b = boundaries(p)[words - 1];
    var r = document.createRange();
    r.setStart(b[0], b[1]);
    r.setEndAfter(p.lastChild);
    var rest = document.createElement("p");
    rest.className = "cont";
    rest.appendChild(r.extractContents());
    return rest;
  }

  function paginate() {
    var tmp = document.createElement("div");
    tmp.innerHTML = flowHTML;
    var queue = Array.prototype.slice.call(tmp.children);
    var num = 2, page = newPage(num), cols = page.querySelector(".mag-cols"), pages = [page];

    while (queue.length) {
      var node = queue.shift();
      cols.appendChild(node);
      if (!overflows(cols)) continue;
      cols.removeChild(node);

      if (node.tagName === "P") {
        var lo = 0, hi = boundaries(node).length;
        while (lo < hi) {
          var mid = (lo + hi + 1) >> 1, probe = node.cloneNode(true);
          split(probe, mid);
          cols.appendChild(probe);
          var fits = !overflows(cols);
          cols.removeChild(probe);
          if (fits) lo = mid; else hi = mid - 1;
        }
        if (lo > 0) {
          queue.unshift(split(node, lo));
          cols.appendChild(node);
        } else {
          queue.unshift(node);
          var last = cols.lastElementChild;
          if (last && /^H/.test(last.tagName)) queue.unshift(cols.removeChild(last));
        }
      } else {
        queue.unshift(node);
      }

      /* A block that cannot fit even an empty page is placed anyway rather than looping. */
      if (!cols.children.length) { cols.appendChild(queue.shift()); continue; }
      page = newPage(++num);
      cols = page.querySelector(".mag-cols");
      pages.push(page);
    }
    return pages;
  }

  function build() {
    clearTimeout(settle);
    spread = wide.matches;
    var size = spread ? SIZES.spread : SIZES.single;
    pageW = size[0];
    pageH = size[1];

    book.appendChild(cover);
    book.appendChild(end);
    Array.prototype.forEach.call(book.querySelectorAll(".leaf, .mag-page.gen"), function (el) { el.remove(); });
    flow.hidden = true;
    book.className = "mag-book is-ready" + (spread ? " is-spread" : "");
    scaler.style.position = "absolute";
    scaler.style.width = (spread ? 2 * pageW : pageW) + "px";
    scaler.style.height = pageH + "px";
    [cover, end].forEach(function (p) { sizePage(p); p.classList.remove("front", "back"); });

    var pages = [cover].concat(paginate());
    if (spread && pages.length % 2 === 0) {
      var blank = document.createElement("section");
      blank.className = "mag-page gen mag-blank";
      sizePage(blank);
      pages.push(blank);
    }
    pages.push(end);
    total = pages.length;

    leaves = [];
    for (var i = 0; i < pages.length; i += spread ? 2 : 1) {
      var leaf = document.createElement("div");
      leaf.className = "leaf";
      pages[i].classList.add("front");
      leaf.appendChild(pages[i]);
      if (spread && pages[i + 1]) {
        pages[i + 1].classList.add("back");
        leaf.appendChild(pages[i + 1]);
      }
      book.appendChild(leaf);
      leaves.push(leaf);
    }
    cur = 0;
    render();
    rescale();
  }

  function render(moving) {
    var n = leaves.length;
    leaves.forEach(function (l, i) {
      var flipped = i < cur;
      l.classList.toggle("flipped", flipped);
      l.style.zIndex = flipped ? i + 1 : n - i;
    });
    if (moving != null) {
      leaves[moving].style.zIndex = n + 1;
      clearTimeout(settle);
      settle = setTimeout(render, 950);
    }
    var max = spread ? n : n - 1;
    book.classList.toggle("at-start", cur === 0);
    book.classList.toggle("at-end", spread && cur === n);
    prev.disabled = cur === 0;
    next.disabled = cur >= max;
    if (!spread) label.textContent = "Page " + (cur + 1) + " of " + total;
    else if (cur === 0) label.textContent = "Cover";
    else if (cur === n) label.textContent = "Back page";
    else label.textContent = "Pages " + 2 * cur + "–" + (2 * cur + 1) + " of " + total;
  }

  function go(step) {
    var max = spread ? leaves.length : leaves.length - 1, target = cur + step;
    if (target < 0 || target > max) return;
    var moving = step > 0 ? cur : target;
    cur = target;
    render(moving);
  }

  function rescale() {
    var w = (spread ? 2 : 1) * pageW, s = Math.min(1.25, stage.clientWidth / w);
    scaler.style.transform = "translateX(" + (stage.clientWidth - w * s) / 2 + "px) scale(" + s + ")";
    stage.style.height = pageH * s + "px";
  }

  prev.addEventListener("click", function () { go(-1); });
  next.addEventListener("click", function () { go(1); });
  book.addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    var r = book.getBoundingClientRect();
    go(e.clientX > r.left + r.width / 2 ? 1 : -1);
  });
  mag.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  });
  var touchX = null;
  book.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  book.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (wide.matches !== spread) build(); else rescale();
    }, 150);
  });

  var faces = ['12.5px "Noto Serif"', 'italic 12.5px "Noto Serif"', '700 12.5px "Noto Serif"', '600 25px "IBM Plex Sans"'];
  var fontsReady = document.fonts
    ? Promise.all(faces.map(function (f) { return document.fonts.load(f); }))
    : Promise.resolve();
  fontsReady.then(build, build);
})();
