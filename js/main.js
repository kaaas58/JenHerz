(function () {
  "use strict";

  /* ---------- Mobile navigation toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Menü öffnen");
      });
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Testimonial carousel ---------- */
  var track = document.getElementById("carouselTrack");
  var prevBtn = document.getElementById("carouselPrev");
  var nextBtn = document.getElementById("carouselNext");

  /* Endlosschleife: vor und nach den echten Karten je eine vollständige
     Kopie anhängen, damit beim Überlauf unbemerkt zurückgesprungen werden kann */
  var numRealCards = 0;

  function getStep() {
    var card = track.querySelector(".testimonial-card");
    var cardWidth = card ? card.getBoundingClientRect().width : 340;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    return cardWidth + gap;
  }

  function setupLoopClones() {
    if (!track || numRealCards) return;
    var realCards = Array.prototype.slice.call(track.querySelectorAll(".testimonial-card"));
    if (realCards.length < 2) return;
    numRealCards = realCards.length;

    var preFrag = document.createDocumentFragment();
    realCards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.removeAttribute("id");
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("tabindex", "-1");
      preFrag.appendChild(clone);
    });
    track.insertBefore(preFrag, track.firstChild);

    realCards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.removeAttribute("id");
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("tabindex", "-1");
      track.appendChild(clone);
    });

    track.scrollLeft = numRealCards * getStep();
  }

  function scrollByCard(direction) {
    if (!track) return;
    var step = getStep();
    track.scrollBy({ left: direction * step, behavior: "smooth" });
    collapseFeatureCards();

    if (numRealCards) {
      setTimeout(function () {
        var span = numRealCards * step;
        if (direction > 0 && track.scrollLeft >= span * 2 - 1) {
          track.scrollLeft -= span;
        } else if (direction < 0 && track.scrollLeft <= 1) {
          track.scrollLeft += span;
        }
      }, 500);
    }
  }

  if (track) {
    setupLoopClones();
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (numRealCards) track.scrollLeft = numRealCards * getStep();
      }, 200);
    });
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { scrollByCard(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { scrollByCard(1); });

  /* ---------- Angebot-Kacheln: auf-/zuklappen ---------- */
  var offerTiles = document.querySelectorAll(".offer-grid .tile");

  function setTileExpanded(tile, expanded) {
    var body = tile.querySelector(".tile__body");
    if (!body) return;
    if (expanded) {
      body.style.maxHeight = body.scrollHeight + "px";
    } else {
      body.style.maxHeight = "";
    }
    tile.classList.toggle("is-expanded", expanded);
    tile.setAttribute("aria-expanded", String(expanded));
  }

  offerTiles.forEach(function (tile) {
    tile.addEventListener("click", function () {
      setTileExpanded(tile, !tile.classList.contains("is-expanded"));
    });
    tile.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        setTileExpanded(tile, !tile.classList.contains("is-expanded"));
      }
    });
  });

  document.addEventListener("click", function (event) {
    offerTiles.forEach(function (tile) {
      if (tile.classList.contains("is-expanded") && !tile.contains(event.target)) {
        setTileExpanded(tile, false);
      }
    });
  });

  /* ---------- Über mich: Bild umdrehen ---------- */
  var aboutMedia = document.querySelector(".about__media--flip");

  if (aboutMedia) {
    var toggleAboutMedia = function () {
      var isFlipped = !aboutMedia.classList.contains("is-flipped");
      aboutMedia.classList.toggle("is-flipped", isFlipped);
      aboutMedia.setAttribute("aria-pressed", String(isFlipped));
    };

    aboutMedia.addEventListener("click", toggleAboutMedia);
    aboutMedia.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        toggleAboutMedia();
      }
    });
  }

  /* ---------- Feature testimonials: flip / expand on click ---------- */
  var featureCards = document.querySelectorAll(".testimonial-card--feature");

  function setFlipped(card, flipped) {
    card.classList.toggle("is-flipped", flipped);
    card.setAttribute("aria-pressed", String(flipped));
  }

  function collapseFeatureCards(except) {
    featureCards.forEach(function (card) {
      if (card !== except && card.classList.contains("is-flipped")) {
        setFlipped(card, false);
      }
    });
  }

  function toggleFlip(card) {
    var isFlipped = !card.classList.contains("is-flipped");
    collapseFeatureCards(card);
    setFlipped(card, isFlipped);
  }

  featureCards.forEach(function (card) {
    card.addEventListener("click", function () {
      toggleFlip(card);
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        toggleFlip(card);
      }
    });
  });
})();
