const root = document.documentElement;
const cinematicScenes = Array.from(
  document.querySelectorAll(".experience--landing .scene, .flow-scene, .nox-hero, .nox-story, .leviathan-scene"),
);
const scenes = cinematicScenes.length ? cinematicScenes : Array.from(document.querySelectorAll("[data-scene]"));
const shouldPersistVisibility = cinematicScenes.length > 0;
const collectionToggle = document.querySelector(".collection-toggle");
const collectionOverlay = document.querySelector(".collection-overlay");
const collectionClose = document.querySelector(".collection-close");
const collectionNavTriggers = Array.from(document.querySelectorAll(".collection-nav__trigger"));
const flowHero = document.querySelector(".flow-scene--hero");
const portal = document.querySelector(".scene--portal");
const customCursor = document.querySelector(".custom-cursor");
const cursorDot = customCursor?.querySelector(".custom-cursor__dot");
const cursorRing = customCursor?.querySelector(".custom-cursor__ring");

document
  .querySelectorAll(
    ".experience--landing .hero__caption, .experience--landing .collection-entry, .flow-scene__label, .flow-scene__copy h1, .flow-scene__copy h2",
  )
  .forEach((element) => element.classList.add("reveal-text"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (shouldPersistVisibility) {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      }
    });
  },
  {
    threshold: shouldPersistVisibility ? 0.35 : 0.36,
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

const supportsCustomCursor =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(any-pointer: coarse)").matches;

if (customCursor && cursorDot && cursorRing && supportsCustomCursor) {
  root.classList.add("has-custom-cursor");

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let ringX = targetX;
  let ringY = targetY;
  let dotScale = 1;
  let ringScale = 1;
  let dotScaleTarget = 1;
  let ringScaleTarget = 1;
  let cursorVisible = false;

  const interactiveSelector = [
    "a",
    "button",
    "[role='button']",
    ".scene--portal",
    ".collection-toggle",
    ".collection-close",
    ".collection-scrim",
    ".collection-nav a",
  ].join(",");

  const setCursorState = (target) => {
    const portalTarget = target?.closest?.(".scene--portal");
    const hoverTarget = target?.closest?.(interactiveSelector);

    customCursor.classList.toggle("cursor-hover", Boolean(hoverTarget));
    customCursor.classList.toggle("cursor-portal", Boolean(portalTarget));

    dotScaleTarget = portalTarget ? 1.35 : hoverTarget ? 1.18 : 1;
    ringScaleTarget = portalTarget ? 2 : hoverTarget ? 1.6 : 1;
  };

  const renderCursor = () => {
    ringX += (targetX - ringX) * 0.16;
    ringY += (targetY - ringY) * 0.16;
    dotScale += (dotScaleTarget - dotScale) * 0.22;
    ringScale += (ringScaleTarget - ringScale) * 0.16;

    cursorDot.style.transform = `translate3d(${(targetX - 2).toFixed(2)}px, ${(targetY - 2).toFixed(2)}px, 0) scale(${dotScale.toFixed(3)})`;
    cursorRing.style.transform = `translate3d(${(ringX - 12).toFixed(2)}px, ${(ringY - 12).toFixed(2)}px, 0) scale(${ringScale.toFixed(3)})`;

    window.requestAnimationFrame(renderCursor);
  };

  window.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;

    if (!cursorVisible) {
      cursorVisible = true;
      customCursor.classList.add("is-visible");
    }

    setCursorState(event.target);
  });

  document.addEventListener("pointerover", (event) => setCursorState(event.target));
  document.addEventListener("pointerout", (event) => setCursorState(event.relatedTarget));
  document.addEventListener("pointerleave", () => {
    cursorVisible = false;
    customCursor.classList.remove("is-visible", "cursor-hover", "cursor-portal");
  });

  renderCursor();
}

if (collectionToggle && collectionOverlay) {
  let lastFocusedElement = null;

  const getDrawerFocusable = () =>
    Array.from(collectionOverlay.querySelectorAll("a[href], button:not([disabled])")).filter(
      (element) => element.offsetParent !== null,
    );

  const setCollectionOpen = (isOpen) => {
    collectionOverlay.classList.toggle("is-open", isOpen);
    collectionOverlay.setAttribute("aria-hidden", String(!isOpen));
    collectionToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);

    if (isOpen) {
      lastFocusedElement = document.activeElement;
      window.setTimeout(() => {
        getDrawerFocusable()[0]?.focus({ preventScroll: true });
      }, 160);
    } else {
      collectionNavTriggers.forEach((trigger) => {
        const submenu = trigger.getAttribute("aria-controls")
          ? document.getElementById(trigger.getAttribute("aria-controls"))
          : null;

        trigger.setAttribute("aria-expanded", "false");
        if (submenu) submenu.hidden = true;
      });

      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus({ preventScroll: true });
        lastFocusedElement = null;
      }
    }
  };

  collectionToggle.addEventListener("click", () => {
    setCollectionOpen(!collectionOverlay.classList.contains("is-open"));
  });

  collectionClose?.addEventListener("click", () => setCollectionOpen(false));

  collectionNavTriggers.forEach((trigger) => {
    const submenu = trigger.getAttribute("aria-controls")
      ? document.getElementById(trigger.getAttribute("aria-controls"))
      : null;

    trigger.addEventListener("click", () => {
      const willOpen = trigger.getAttribute("aria-expanded") !== "true";
      trigger.setAttribute("aria-expanded", String(willOpen));
      if (submenu) submenu.hidden = !willOpen;
    });
  });

  collectionOverlay.addEventListener("click", (event) => {
    if (event.target === collectionOverlay || event.target instanceof Element && event.target.hasAttribute("data-menu-close")) {
      setCollectionOpen(false);
    }
  });

  collectionOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setCollectionOpen(false));
  });

  window.addEventListener("keydown", (event) => {
    if (!collectionOverlay.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      setCollectionOpen(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getDrawerFocusable();
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus({ preventScroll: true });
    }
  });
}

if (portal) {
  portal.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    portal.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = portal.href;
    }, 400);
  });
}
