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

  function scrollByCard(direction) {
    if (!track) return;
    var card = track.querySelector(".testimonial-card");
    var cardWidth = card ? card.getBoundingClientRect().width : 340;
    var gap = 24;
    track.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
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

  /* ---------- Feature testimonial: flip / expand on click ---------- */
  var featureCard = document.getElementById("featureTestimonial");

  function toggleFlip() {
    var isFlipped = featureCard.classList.toggle("is-flipped");
    featureCard.setAttribute("aria-pressed", String(isFlipped));
  }

  if (featureCard) {
    featureCard.addEventListener("click", toggleFlip);
    featureCard.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        toggleFlip();
      }
    });
  }
})();
