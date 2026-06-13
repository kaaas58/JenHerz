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

  /* Endlosschleife auf Mobile: vorne/hinten je eine Klon-Karte anhängen,
     damit beim Überlauf unbemerkt zur echten Karte zurückgesprungen werden kann */
  var loopMq = window.matchMedia("(max-width: 700px)");
  var startClone = null;
  var endClone = null;

  function getStep() {
    var card = track.querySelector(".testimonial-card");
    var cardWidth = card ? card.getBoundingClientRect().width : 340;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    return cardWidth + gap;
  }

  function setupLoopClones() {
    if (!track || startClone) return;
    var cards = track.querySelectorAll(".testimonial-card");
    if (cards.length < 2) return;

    endClone = cards[0].cloneNode(true);
    startClone = cards[cards.length - 1].cloneNode(true);
    [startClone, endClone].forEach(function (clone) {
      clone.removeAttribute("id");
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("tabindex", "-1");
    });

    track.insertBefore(startClone, track.firstChild);
    track.appendChild(endClone);
    track.scrollLeft = getStep();
  }

  function teardownLoopClones() {
    if (!startClone) return;
    startClone.parentNode.removeChild(startClone);
    endClone.parentNode.removeChild(endClone);
    startClone = null;
    endClone = null;
    track.scrollLeft = 0;
  }

  function syncLoopClones() {
    if (loopMq.matches) {
      setupLoopClones();
    } else {
      teardownLoopClones();
    }
  }

  function scrollByCard(direction) {
    if (!track) return;
    var step = getStep();
    track.scrollBy({ left: direction * step, behavior: "smooth" });
    collapseFeatureCards();

    if (startClone) {
      setTimeout(function () {
        var maxScroll = track.scrollWidth - track.clientWidth;
        if (direction > 0 && track.scrollLeft >= maxScroll - 1) {
          track.scrollLeft = step;
        } else if (direction < 0 && track.scrollLeft <= 1) {
          track.scrollLeft = maxScroll - step;
        }
      }, 500);
    }
  }

  if (track) {
    syncLoopClones();
    if (loopMq.addEventListener) {
      loopMq.addEventListener("change", syncLoopClones);
    } else {
      loopMq.addListener(syncLoopClones);
    }
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
