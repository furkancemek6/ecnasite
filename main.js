const root = document.documentElement;
const scenes = Array.from(document.querySelectorAll("[data-scene]"));
const collectionToggle = document.querySelector(".collection-toggle");
const collectionTriggers = Array.from(document.querySelectorAll(".collection-toggle, .collection-entry"));
const collectionOverlay = document.querySelector(".collection-overlay");
const flowHero = document.querySelector(".flow-scene--hero");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  },
  {
    threshold: 0.36,
  },
);

scenes.forEach((scene) => observer.observe(scene));

let ticking = false;

const setDrift = () => {
  const viewport = window.innerHeight || 1;

  scenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    const centerDistance = rect.top + rect.height / 2 - viewport / 2;
    const drift = Math.max(-1, Math.min(1, centerDistance / viewport));
    scene.style.setProperty("--drift", `${(drift * -18).toFixed(2)}px`);
  });

  if (flowHero) {
    const rect = flowHero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - viewport || viewport)));
    flowHero.style.setProperty("--flow-hero-scale", (1 + progress * 0.03).toFixed(4));
    flowHero.style.setProperty("--flow-hero-y", `${(-progress * 3).toFixed(3)}%`);
  }

  ticking = false;
};

const requestDrift = () => {
  if (!ticking) {
    window.requestAnimationFrame(setDrift);
    ticking = true;
  }
};

window.addEventListener("scroll", requestDrift, { passive: true });
window.addEventListener("resize", requestDrift);
setDrift();

if (collectionTriggers.length && collectionOverlay) {
  const setCollectionOpen = (isOpen) => {
    collectionOverlay.classList.toggle("is-open", isOpen);
    collectionOverlay.setAttribute("aria-hidden", String(!isOpen));
    collectionTriggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
  };

  collectionTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      setCollectionOpen(!collectionOverlay.classList.contains("is-open"));
    });
  });

  collectionOverlay.addEventListener("click", (event) => {
    if (event.target === collectionOverlay) setCollectionOpen(false);
  });

  collectionOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setCollectionOpen(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setCollectionOpen(false);
  });
}
