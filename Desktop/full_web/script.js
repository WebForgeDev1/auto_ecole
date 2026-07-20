const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");

const updateHeader = () => {
  header.classList.toggle("is-scrolled", header.classList.contains("inner-header") || window.scrollY > 12);
};

// Defer the first call: reading window.scrollY synchronously at parse time,
// while the page is still settling layout, is what shows up as "forced reflow".
requestAnimationFrame(updateHeader);
window.addEventListener("scroll", updateHeader, { passive: true });

if (navToggle && nav) {
  const setNavOpen = (isOpen) => {
    nav.classList.toggle("is-open", isOpen);
    header.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
    document.body.classList.toggle("no-scroll", isOpen);
  };

  navToggle.addEventListener("click", () => {
    setNavOpen(!header.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-open")) setNavOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!header.classList.contains("is-open")) return;
    if (header.contains(event.target)) return;
    setNavOpen(false);
  });
}

if (contactForm && formNote) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    if (formData.get("_gotcha")) return; // honeypot rempli : soumission silencieusement ignorée
    const name = String(formData.get("name") || "").trim();
    fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then((response) => {
        if (response.ok) {
          formNote.textContent = name
            ? `Merci ${name}, votre demande a bien été envoyée à Hk Conduite.`
            : "Merci, votre demande a bien été envoyée à Hk Conduite.";
          contactForm.reset();
        } else {
          formNote.textContent = "Une erreur est survenue. Merci de réessayer ou de nous appeler directement.";
        }
        formNote.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(() => {
        formNote.textContent = "Une erreur est survenue. Merci de réessayer ou de nous appeler directement.";
        formNote.scrollIntoView({ behavior: "smooth", block: "center" });
      });
  });
}

const calendlyEmbed = document.querySelector("[data-calendly-embed]");
const calendlyLoadBtn = document.querySelector("[data-calendly-load]");

if (calendlyEmbed && calendlyLoadBtn) {
  calendlyLoadBtn.addEventListener("click", () => {
    const url = calendlyEmbed.getAttribute("data-calendly-url");
    const widget = document.createElement("div");
    widget.className = "calendly-inline-widget";
    widget.setAttribute("data-url", url);
    widget.style.minWidth = "320px";
    widget.style.height = window.innerWidth <= 640 ? "1000px" : "700px";
    calendlyEmbed.replaceChildren(widget);

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  });
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const spotlightQuery = window.matchMedia("(min-width: 641px)");

document.querySelectorAll(".carousel-wrap").forEach((wrap) => {
  const track = wrap.querySelector(".review-grid-static, .team-grid");
  const prevBtn = wrap.querySelector(".carousel-arrow.prev");
  const nextBtn = wrap.querySelector(".carousel-arrow.next");
  if (!track || !prevBtn || !nextBtn) return;

  const isTeamGrid = track.classList.contains("team-grid");
  const cards = isTeamGrid ? Array.prototype.slice.call(track.children) : [];

  // ---------- scroll mode (mobile carousels + desktop review grid) ----------
  const getStep = () => {
    const firstCard = track.children[0];
    if (!firstCard) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    return firstCard.getBoundingClientRect().width + gap;
  };

  const updateScrollArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft >= maxScroll - 4;
  };

  const scrollPrev = () => track.scrollBy({ left: -getStep(), behavior: reducedMotion ? "auto" : "smooth" });
  const scrollNext = () => track.scrollBy({ left: getStep(), behavior: reducedMotion ? "auto" : "smooth" });

  let ticking = false;
  track.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateScrollArrows();
      ticking = false;
    });
  }, { passive: true });

  // ---------- spotlight mode (team-grid, desktop only) ----------
  let spotlightActive = false;
  let focusIndex = 1; // 2e carte (la monitrice) au chargement

  const slotFor = (cardIndex, focus) => ((cardIndex - focus + 1) % 3 + 3) % 3;

  const getSpotlightMetrics = () => {
    const gapPx = parseFloat(getComputedStyle(track).gap || getComputedStyle(track).columnGap || "22.4");
    const containerWidth = track.getBoundingClientRect().width;
    const cardWidth = (containerWidth - gapPx * 2) / 3;
    return { gapPx, cardWidth, step: cardWidth + gapPx };
  };

  const applyBorderOnly = () => {
    cards.forEach((card, i) => {
      const isFocus = i === focusIndex;
      card.style.transform = "";
      card.classList.remove("is-focus", "is-side");
      card.classList.toggle("is-focus-static", isFocus);
      card.setAttribute("aria-current", isFocus ? "true" : "false");
    });
  };

  const layoutSpotlight = (animate) => {
    const { cardWidth, step } = getSpotlightMetrics();
    track.style.setProperty("--spotlight-card-w", cardWidth + "px");

    // Batch all writes first, then a single forced-reflow read, then all
    // "re-enable transition" writes — avoids one write/read/write cycle per
    // card (layout thrashing), which is what triggers "forced reflow" warnings.
    cards.forEach((card, i) => {
      const slot = slotFor(i, focusIndex);
      const isFocus = slot === 1;
      if (!animate) card.style.transition = "none";
      card.style.width = cardWidth + "px";
      card.style.transform = `translateX(${slot * step}px) scale(${isFocus ? 1.06 : 0.92})`;
      card.classList.toggle("is-focus", isFocus);
      card.classList.toggle("is-side", !isFocus);
      card.classList.remove("is-focus-static");
      card.setAttribute("aria-current", isFocus ? "true" : "false");
    });

    if (!animate) {
      void track.offsetWidth; // single forced reflow for the whole batch
      cards.forEach((card) => { card.style.transition = ""; });
    }

    const tallest = Math.max.apply(null, cards.map((c) => c.getBoundingClientRect().height));
    track.style.height = tallest * 1.1 + "px";
  };

  const rotateSpotlight = (direction) => {
    const { step } = getSpotlightMetrics();
    const oldFocus = focusIndex;
    const wrapSlot = direction === 1 ? 0 : 2;
    const wrapCardIndex = cards.findIndex((_, i) => slotFor(i, oldFocus) === wrapSlot);
    const wrapCard = cards[wrapCardIndex];
    const offStageSlot = direction === 1 ? 3 : -1;

    wrapCard.style.transition = "none";
    wrapCard.style.transform = `translateX(${offStageSlot * step}px) scale(0.92)`;
    void wrapCard.offsetWidth;
    wrapCard.style.transition = "";

    focusIndex = (focusIndex + direction + 3) % 3;
    requestAnimationFrame(() => layoutSpotlight(true));
  };

  const setupSpotlight = () => {
    track.classList.add("js-spotlight");
    if (reducedMotion) {
      applyBorderOnly();
    } else {
      layoutSpotlight(false);
    }
  };

  const teardownSpotlight = () => {
    track.classList.remove("js-spotlight");
    track.style.height = "";
    track.style.removeProperty("--spotlight-card-w");
    cards.forEach((card) => {
      card.style.transform = "";
      card.style.width = "";
      card.style.transition = "";
      card.classList.remove("is-focus", "is-side", "is-focus-static");
      card.removeAttribute("aria-current");
    });
  };

  if (isTeamGrid) {
    cards.forEach((card, i) => {
      card.addEventListener("click", () => {
        if (!spotlightActive || i === focusIndex) return;
        if (reducedMotion) {
          focusIndex = i;
          applyBorderOnly();
          return;
        }
        const diff = (i - focusIndex + 3) % 3;
        rotateSpotlight(diff === 1 ? 1 : -1);
      });
    });
  }

  // ---------- shared arrow clicks: branch by current mode ----------
  prevBtn.addEventListener("click", () => {
    if (isTeamGrid && spotlightActive) {
      if (reducedMotion) {
        focusIndex = (focusIndex - 1 + 3) % 3;
        applyBorderOnly();
      } else {
        rotateSpotlight(-1);
      }
    } else {
      scrollPrev();
    }
  });
  nextBtn.addEventListener("click", () => {
    if (isTeamGrid && spotlightActive) {
      if (reducedMotion) {
        focusIndex = (focusIndex + 1) % 3;
        applyBorderOnly();
      } else {
        rotateSpotlight(1);
      }
    } else {
      scrollNext();
    }
  });

  // ---------- mode switching (load + resize) ----------
  const syncMode = () => {
    if (isTeamGrid && spotlightQuery.matches) {
      if (!spotlightActive) {
        spotlightActive = true;
        setupSpotlight();
      }
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    } else {
      if (spotlightActive) {
        spotlightActive = false;
        teardownSpotlight();
      }
      updateScrollArrows();
    }
  };

  window.addEventListener("resize", syncMode);
  syncMode();
});
