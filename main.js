const root = document.documentElement;
const cinematicScenes = Array.from(
  document.querySelectorAll(
    ".experience--landing .scene, .monolith-section, .flow-scene, .nox-hero, .nox-story, .leviathan-scene, .tide-section, .core-scene, .cairn-scene, .talus-scene, .spar-scene, .drape-scene",
  ),
);
const scenes = cinematicScenes.length ? cinematicScenes : Array.from(document.querySelectorAll("[data-scene]"));
const shouldPersistVisibility = cinematicScenes.length > 0;
const collectionToggle = document.querySelector(".collection-toggle");
const collectionOverlay = document.querySelector(".collection-overlay");
const collectionClose = document.querySelector(".collection-close");
const collectionNavTriggers = Array.from(document.querySelectorAll(".collection-nav__trigger"));
const flowHero = document.querySelector(".flow-scene--hero");
const portal = document.querySelector(".scene--portal");
const connectForm = document.querySelector(".connect-form");
const customCursor = document.querySelector(".custom-cursor");
const cursorDot = customCursor?.querySelector(".custom-cursor__dot");
const cursorRing = customCursor?.querySelector(".custom-cursor__ring");
const scriptRoot = new URL(".", document.currentScript?.src || window.location.href);
const canUseHoverPreview = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const isHomepage = Boolean(document.querySelector(".experience--landing"));
const collectionPreviewSources = {
  monolith: "assets/ecna-monolith-reference.jpeg",
  tide: "assets/ecna-tide-hero.png",
  core: "assets/ecna-core-hero.jpeg",
  cairn: "assets/CAIRN HERO.jpeg",
  talus: "assets/talus hero.jpeg",
  spar: "assets/spar1.png",
  drape: "assets/drape1.jpeg",
  leviathan: "assets/ecna-leviathan-main.png",
  flow: "assets/ecna-flow-final-object.png",
  nox: "assets/ecna-nox-scene.png",
};

document.body.classList.add("page-transition-ready");

const shouldShowOpeningMark = () => {
  if (!isHomepage) return false;

  try {
    if (!window.sessionStorage || window.sessionStorage.getItem("ecna-opening-mark-seen")) return false;
    window.sessionStorage.setItem("ecna-opening-mark-seen", "true");
    return true;
  } catch {
    return false;
  }
};

const showOpeningMark = () => {
  const mark = document.createElement("div");
  mark.className = "opening-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "ECNA";
  document.body.classList.add("opening-mark-active");
  document.body.append(mark);

  window.setTimeout(() => {
    mark.classList.add("is-leaving");
  }, 720);

  window.setTimeout(() => {
    mark.remove();
    document.body.classList.remove("opening-mark-active");
    document.body.classList.add("is-loaded");
  }, 1020);
};

if (shouldShowOpeningMark()) {
  showOpeningMark();
} else {
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-loaded");
  });
}

const getCollectionSlug = (href) => {
  if (!href) return "";
  const parts = new URL(href, window.location.href).pathname
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/\.html$/, "").toLowerCase());

  return parts.find((part) => collectionPreviewSources[part]) || "";
};

const getPreviewSource = (link) => {
  if (link.dataset.preview) return new URL(link.dataset.preview, window.location.href).href;
  const slug = getCollectionSlug(link.getAttribute("href"));
  const source = slug ? collectionPreviewSources[slug] : "";
  return source ? new URL(source, scriptRoot).href : "";
};

document
  .querySelectorAll(
    [
      ".experience--landing .hero__caption",
      ".experience--landing .scene__content p",
      ".experience--landing .monolith-transition__content p",
      ".experience--landing .portal__content span",
      ".experience--landing .portal__content small",
      ".monolith-section__copy > *",
      ".flow-scene__copy > *",
      ".nox-hero__content > *",
      ".nox-story__text",
      ".leviathan-scene__content > *",
      ".tide-section__text > *",
      ".core-scene__content > *",
      ".cairn-scene__content > *",
      ".talus-scene__content > *",
      ".spar-scene__content > *",
      ".drape-scene__content > *",
      ".collections-index__label",
      ".collections-index__list a",
    ].join(", "),
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

const setupCollectionIndexPreview = () => {
  const indexPage = document.querySelector(".collections-index");
  const preview = indexPage?.querySelector(".collections-index__preview");
  const previewImage = preview?.querySelector("img");
  const links = Array.from(indexPage?.querySelectorAll(".collections-index__list a") || []);

  if (!indexPage || !preview || !previewImage || !links.length || !canUseHoverPreview) return;

  const showPreview = (link) => {
    const source = getPreviewSource(link);
    if (!source) return;
    previewImage.src = source;
    preview.classList.add("is-active");
    indexPage.classList.add("has-preview");
  };

  const hidePreview = () => {
    preview.classList.remove("is-active");
    indexPage.classList.remove("has-preview");
  };

  links.forEach((link) => {
    link.addEventListener("pointerenter", () => showPreview(link));
    link.addEventListener("focus", () => showPreview(link));
    link.addEventListener("pointerleave", hidePreview);
    link.addEventListener("blur", hidePreview);
  });
};

const setupMenuPreview = () => {
  const drawer = collectionOverlay?.querySelector(".collection-drawer");
  const links = Array.from(collectionOverlay?.querySelectorAll(".collection-subnav a") || []);

  if (!drawer || !links.length || !canUseHoverPreview) return;

  const preview = document.createElement("div");
  preview.className = "collection-menu-preview";
  preview.setAttribute("aria-hidden", "true");

  const previewImage = document.createElement("img");
  previewImage.alt = "";
  preview.append(previewImage);
  drawer.append(preview);

  const showPreview = (link) => {
    const source = getPreviewSource(link);
    if (!source) return;
    previewImage.src = source;
    preview.classList.add("is-active");
  };

  const hidePreview = () => preview.classList.remove("is-active");

  links.forEach((link) => {
    link.addEventListener("pointerenter", () => showPreview(link));
    link.addEventListener("focus", () => showPreview(link));
    link.addEventListener("pointerleave", hidePreview);
    link.addEventListener("blur", hidePreview);
  });
};

setupCollectionIndexPreview();
setupMenuPreview();

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
      collectionOverlay.querySelector(".collection-menu-preview")?.classList.remove("is-active");
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

if (connectForm) {
  const status = connectForm.querySelector(".connect-form__status");

  connectForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!status) return;

    try {
      status.hidden = false;
      status.classList.remove("is-visible", "is-error");
      status.innerHTML = "THANK YOU.<br>WE WILL GET BACK TO YOU.<span>EACH INQUIRY IS REVIEWED INDIVIDUALLY.</span>";
      window.requestAnimationFrame(() => status.classList.add("is-visible"));
    } catch {
      status.hidden = false;
      status.textContent = "SOMETHING WENT WRONG. PLEASE TRY AGAIN.";
      status.classList.add("is-visible", "is-error");
    }
  });
}

const pageFadeOverlay = document.createElement("div");
pageFadeOverlay.className = "page-fade-overlay";
pageFadeOverlay.setAttribute("aria-hidden", "true");
document.body.append(pageFadeOverlay);

const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
scrollProgress.setAttribute("aria-hidden", "true");
document.body.append(scrollProgress);

let progressTicking = false;
const updateScrollProgress = () => {
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.max(0, Math.min(1, window.scrollY / scrollable));
  scrollProgress.style.setProperty("--scroll-progress", progress.toFixed(4));
  progressTicking = false;
};

const requestScrollProgress = () => {
  if (progressTicking) return;
  progressTicking = true;
  window.requestAnimationFrame(updateScrollProgress);
};

window.addEventListener("scroll", requestScrollProgress, { passive: true });
window.addEventListener("resize", requestScrollProgress);
updateScrollProgress();

const shouldFadeLink = (link, event) => {
  if (!link || event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (link.target && link.target !== "_self") return false;
  if (link.hasAttribute("download")) return false;

  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  const targetUrl = new URL(href, window.location.href);
  if (targetUrl.origin !== window.location.origin) return false;
  if (targetUrl.pathname === window.location.pathname && targetUrl.hash) return false;

  return true;
};

document.addEventListener("click", (event) => {
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!shouldFadeLink(link, event)) return;

  event.preventDefault();
  pageFadeOverlay.classList.add("is-active");
  window.setTimeout(() => {
    window.location.href = link.href;
  }, 360);
});

const soundToggle = document.createElement("button");
soundToggle.className = "ambient-sound-toggle";
soundToggle.type = "button";
soundToggle.setAttribute("aria-pressed", "false");
soundToggle.textContent = "SOUND OFF";
document.body.append(soundToggle);

let ambientContext = null;
let ambientGain = null;
let ambientStarted = false;
let ambientEnabled = false;

const createAmbientSound = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return false;

  ambientContext = new AudioContext();
  ambientGain = ambientContext.createGain();
  ambientGain.gain.value = 0;

  const lowpass = ambientContext.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 480;
  lowpass.Q.value = 0.52;

  const highpass = ambientContext.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 35;

  const buffer = ambientContext.createBuffer(1, ambientContext.sampleRate * 4, ambientContext.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = last * 0.986 + white * 0.014;
    data[i] = last * 0.34;
  }

  const noise = ambientContext.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const tone = ambientContext.createOscillator();
  const toneGain = ambientContext.createGain();
  tone.type = "sine";
  tone.frequency.value = 54;
  toneGain.gain.value = 0.004;

  noise.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(ambientGain);
  tone.connect(toneGain);
  toneGain.connect(ambientGain);
  ambientGain.connect(ambientContext.destination);

  noise.start();
  tone.start();
  ambientStarted = true;
  return true;
};

const setAmbientSound = async (enabled) => {
  if (!ambientStarted && !createAmbientSound()) {
    soundToggle.hidden = true;
    return;
  }

  if (ambientContext?.state === "suspended") await ambientContext.resume();

  const now = ambientContext.currentTime;
  ambientGain.gain.cancelScheduledValues(now);
  ambientGain.gain.setTargetAtTime(enabled ? 0.035 : 0, now, 0.32);
  ambientEnabled = enabled;
  soundToggle.setAttribute("aria-pressed", String(enabled));
  soundToggle.textContent = enabled ? "SOUND ON" : "SOUND OFF";
};

soundToggle.addEventListener("click", () => {
  setAmbientSound(!ambientEnabled).catch(() => {
    soundToggle.hidden = true;
  });
});

