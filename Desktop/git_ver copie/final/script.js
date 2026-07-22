const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const planSelect = document.querySelector("[data-plan-select]");
const selectedTitle = document.querySelector("[data-selected-title]");
const selectedDescription = document.querySelector("[data-selected-description]");
const selectedPrice = document.querySelector("[data-selected-price]");

const plans = {
  "manuel-classique": {
    title: "Permis B manuel classique",
    description: "Formation progressive en boîte manuelle avec code, conduite et suivi complet.",
    price: "Dès 1 190€"
  },
  "manuel-accelere": {
    title: "Permis B manuel accéléré",
    description: "Parcours intensif en boîte manuelle pour les élèves disponibles sur des créneaux rapprochés.",
    price: "Dès 1 490€"
  },
  "auto-classique": {
    title: "Boîte automatique classique",
    description: "Formation en automatique pour se concentrer sur la route, les priorités et la sécurité.",
    price: "Dès 890€"
  },
  "auto-accelere": {
    title: "Boîte automatique accélérée",
    description: "Parcours rapide en automatique avec planning renforcé et préparation examen.",
    price: "Dès 1 190€"
  }
};

const updateHeader = () => {
  header.classList.toggle("is-scrolled", header.classList.contains("inner-header") || window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    header.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      header.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (contactForm && formNote) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    formNote.textContent = name
      ? `Merci ${name}, votre demande est prête pour HK Auto École.`
      : "Merci, votre demande est prête pour HK Auto École.";
    contactForm.reset();
  });
}

const updateSelectedPlan = (value) => {
  const plan = plans[value];
  if (!selectedTitle || !selectedDescription || !selectedPrice || !plan) return;
  selectedTitle.textContent = plan.title;
  selectedDescription.textContent = plan.description;
  selectedPrice.textContent = plan.price;
};

if (planSelect) {
  const params = new URLSearchParams(window.location.search);
  const initialPlan = params.get("formule");
  if (initialPlan && plans[initialPlan]) {
    planSelect.value = initialPlan;
    updateSelectedPlan(initialPlan);
  }
  planSelect.addEventListener("change", () => updateSelectedPlan(planSelect.value));
}
