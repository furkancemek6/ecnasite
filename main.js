const root = document.documentElement;
const scenes = Array.from(document.querySelectorAll("[data-scene]"));

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
