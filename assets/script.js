/* =========================================================
   Chiwoo Roh — personal site
   Theme toggle · click-to-copy · JSON rendering
   ========================================================= */

(function () {
  "use strict";

  /* ---------------- paths ---------------- */
  // Works whether the page sits at / or /some/sub/path/
  var ROOT = document.documentElement.getAttribute("data-root") || "";

  function url(p) { return ROOT + p; }

  /* ---------------- theme ---------------- */
  var THEME_KEY = "cr-theme";

  function applyTheme(t) {
    if (t === "dark" || t === "light") {
      document.documentElement.setAttribute("data-theme", t);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function currentTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (stored) return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }

  applyTheme((function () {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  })());

  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ---------------- click-to-copy email ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".copy-email"), function (el) {
    el.addEventListener("click", function () {
      var addr = el.getAttribute("data-email") || el.textContent.trim();
      var done = function () {
        var was = el.textContent;
        el.classList.add("copied");
        el.textContent = "Copied";
        setTimeout(function () {
          el.classList.remove("copied");
          el.textContent = was;
        }, 1400);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(addr).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = addr;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------------- helpers ---------------- */
  function fail(el, what) {
    if (!el) return;
    el.innerHTML = '<p class="note">Could not load ' + what +
      '. If you are opening this file directly, run a local server instead ' +
      '(<code>python3 -m http.server</code>).</p>';
  }

  function getJSON(path, cb, el, what) {
    fetch(url(path))
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(cb)
      .catch(function () { fail(el, what); });
  }

  // "**Roh, C.**, & Won, M." -> highlights the author's own name
  function authors(str) {
    return String(str).replace(/\*\*(.+?)\*\*/g, '<span class="me">$1</span>');
  }

  /* ---------------- news ---------------- */
  var newsCache = null;

  function newsItem(n) {
    return '<li><span class="news-date">' + n.label +
      '</span><span class="news-text">' + n.text + "</span></li>";
  }

  function paintNews() {
    if (!newsCache) return;
    var preview = document.getElementById("news-preview");
    if (preview) preview.innerHTML = newsCache.slice(0, 5).map(newsItem).join("");
    var full = document.getElementById("news-all");
    if (full) full.innerHTML = newsCache.map(newsItem).join("");
  }

  function renderNews() {
    if (newsCache) { paintNews(); return; }
    var target = document.getElementById("news-preview") || document.getElementById("news-all");
    if (!target) return;
    getJSON("data/news.json", function (data) {
      newsCache = data.slice().sort(function (a, b) {
        return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
      });
      paintNews();
    }, target, "news");
  }

  /* ---------------- publications ---------------- */
  function pubHTML(p, compact) {
    var out = ['<div class="pub' + (compact ? " compact" : "") + '">'];

    if (!compact) {
      out.push('<div class="pub-fig">');
      if (p.figure) {
        out.push('<img src="' + url(p.figure) + '" alt="" loading="lazy" ' +
          "onerror=\"this.parentElement.textContent='Figure coming'\">");
      } else {
        out.push("Figure coming");
      }
      out.push("</div>");
    }

    out.push("<div>");
    out.push('<p class="pub-title">' + p.title + "</p>");
    out.push('<p class="pub-authors">' + authors(p.authors) + "</p>");
    out.push('<p class="pub-venue">' + p.venue + ", " + p.year + ".</p>");

    var bits = [];
    if (p.badge) bits.push('<span class="badge">' + p.badge + "</span>");
    if (p.award) bits.push('<span class="badge award">' + p.award + "</span>");
    if (p.type === "review") bits.push('<span class="badge review">Under review</span>');
    if (p.links) {
      Object.keys(p.links).forEach(function (k) {
        bits.push('<a href="' + p.links[k] + '" target="_blank" rel="noopener">' + k + "</a>");
      });
    }
    if (bits.length) out.push('<p class="pub-links">' + bits.join("") + "</p>");

    out.push("</div></div>");
    return out.join("");
  }

  function byYearDesc(a, b) { return b.year - a.year; }

  function renderPublications() {
    var selectedEl = document.getElementById("pub-selected");
    var listEl = document.getElementById("pub-list");
    if (!selectedEl && !listEl) return;

    getJSON("data/publications.json", function (data) {
      if (selectedEl) {
        selectedEl.innerHTML = data
          .filter(function (p) { return p.selected; })
          .slice(0, 3)
          .map(function (p) { return pubHTML(p, false); })
          .join("");
      }

      var jc = document.getElementById("stat-journal");
      var cc = document.getElementById("stat-conference");
      if (jc) jc.textContent = data.filter(function (p) { return p.type === "journal"; }).length;
      if (cc) cc.textContent = data.filter(function (p) { return p.type === "conference"; }).length;

      if (listEl) {
        var draw = function (kind) {
          var rows = data.filter(function (p) { return kind === "all" || p.type === kind; })
                         .sort(byYearDesc);
          listEl.innerHTML = rows.map(function (p) { return pubHTML(p, true); }).join("");
        };
        draw("all");
        Array.prototype.forEach.call(document.querySelectorAll(".filters button"), function (b) {
          b.addEventListener("click", function () {
            Array.prototype.forEach.call(document.querySelectorAll(".filters button"), function (o) {
              o.setAttribute("aria-pressed", String(o === b));
            });
            draw(b.getAttribute("data-kind"));
          });
        });
      }
    }, selectedEl || listEl, "publications");
  }

  /* ---------------- projects ---------------- */
  function renderProjects() {
    var el = document.getElementById("project-list");
    if (!el) return;

    getJSON("data/projects.json", function (data) {
      el.innerHTML = data.map(function (p) {
        return '<div class="entry">' +
          "<h3>" + p.title + "</h3>" +
          '<dl class="meta">' +
            "<dt>Funder</dt><dd>" + p.funder + "</dd>" +
            (p.program && p.program !== "—" ? "<dt>Program</dt><dd>" + p.program + "</dd>" : "") +
            "<dt>Duration</dt><dd>" + p.duration +
              " <span style=\"color:var(--ink-3)\">(participated " + p.participated + ")</span></dd>" +
            "<dt>Funding</dt><dd>" + p.funding + "</dd>" +
            "<dt>Role</dt><dd>" + p.role + "</dd>" +
          "</dl></div>";
      }).join("");
    }, el, "projects");
  }

  /* ---------------- footer ---------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var updEl = document.getElementById("last-updated");
  if (updEl) {
    var d = new Date(document.lastModified);
    if (!isNaN(d)) {
      updEl.textContent = "Last updated " + d.toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
      });
    }
  }

  /* ---------------- go ---------------- */
  renderNews();
  renderPublications();
  renderProjects();
})();
