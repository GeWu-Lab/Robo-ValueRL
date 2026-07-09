const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initCitationCopy() {
  const button = document.querySelector("[data-copy-target]");
  if (!button) return;

  button.addEventListener("click", async () => {
    const targetId = button.getAttribute("data-copy-target");
    const target = document.getElementById(targetId);
    if (!target) return;

    const originalText = button.textContent;
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1400);
    } catch {
      button.textContent = "Select BibTeX to copy";
      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1800);
    }
  });
}

function initReveals() {
  const elements = Array.from(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
}

function initVideoSwitchers() {
  const switchers = Array.from(document.querySelectorAll("[data-switcher]"));
  for (const switcher of switchers) {
    const tabs = Array.from(switcher.querySelectorAll("[data-panel]"));
    const panels = Array.from(switcher.querySelectorAll("[data-panel-id]"));
    const shouldAutoplay = switcher.getAttribute("data-autoplay") === "true" && !reduceMotion;
    const intervalMs = Number.parseInt(switcher.getAttribute("data-interval") || "8000", 10);
    let rotationTimer = 0;

    const getPanelTarget = (panel) => panel.getAttribute("data-panel-id");
    const getPanelVideo = (panel) => panel.querySelector("video");
    const getActiveIndex = () => Math.max(0, panels.findIndex((panel) => panel.classList.contains("is-active")));
    const getNextTarget = () => getPanelTarget(panels[(getActiveIndex() + 1) % panels.length]);

    const clearRotation = () => {
      if (!rotationTimer) return;
      window.clearTimeout(rotationTimer);
      rotationTimer = 0;
    };

    const scheduleRotation = () => {
      clearRotation();
      if (!shouldAutoplay || panels.length < 2) return;
      rotationTimer = window.setTimeout(() => {
        const nextTarget = getNextTarget();
        if (nextTarget) setActivePanel(nextTarget, { auto: true });
      }, Number.isFinite(intervalMs) ? intervalMs : 8000);
    };

    const playVideo = (video) => {
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "auto";
      video.play().catch(() => {});
    };

    const resetVideo = (video) => {
      if (!Number.isFinite(video.duration)) return;
      try {
        video.currentTime = 0;
      } catch {
        // Some browsers reject currentTime updates before metadata is available.
      }
    };

    const setActivePanel = (target, options = {}) => {
      const activeIndex = Math.max(0, panels.findIndex((panel) => panel.getAttribute("data-panel-id") === target));
      const previousIndex = (activeIndex - 1 + panels.length) % panels.length;
      const nextIndex = (activeIndex + 1) % panels.length;

      tabs.forEach((item) => {
        const isActive = item.getAttribute("data-panel") === target;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-current", isActive ? "true" : "false");
      });

      panels.forEach((panel, index) => {
        const isActive = index === activeIndex;
        panel.classList.toggle("is-active", isActive);
        panel.classList.toggle("is-prev", index === previousIndex);
        panel.classList.toggle("is-next", index === nextIndex);
        const video = panel.querySelector("video");
        if (!video) return;
        if (!isActive) {
          video.pause();
          video.preload = "none";
          return;
        }
        video.preload = shouldAutoplay ? "auto" : getActiveVideoPreload();
        if (options.auto || options.play || shouldAutoplay) {
          resetVideo(video);
          playVideo(video);
        }
      });

      scheduleRotation();
    };

    const initial = tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];
    if (initial) setActivePanel(initial.getAttribute("data-panel"));

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setActivePanel(tab.getAttribute("data-panel"), { play: true });
      });
    });

    panels.forEach((panel) => {
      const video = getPanelVideo(panel);
      if (!video) return;
      video.addEventListener("ended", () => {
        if (!shouldAutoplay || !panel.classList.contains("is-active")) return;
        const nextTarget = getNextTarget();
        if (nextTarget) setActivePanel(nextTarget, { auto: true });
      });
    });
  }
}

function initTaskShowcase() {
  const showcases = Array.from(document.querySelectorAll("[data-task-showcase]"));
  for (const showcase of showcases) {
    const selectorCards = Array.from(showcase.querySelectorAll(".task-selector-card[data-task-target]"));
    const mediaPanels = Array.from(showcase.querySelectorAll("[data-task-media]"));
    const triggers = Array.from(showcase.querySelectorAll("[data-task-target]"));
    const shouldAutoplay = showcase.getAttribute("data-task-autoplay") === "true" && !reduceMotion;

    const playTaskVideo = (video) => {
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "auto";
      video.play().catch(() => {});
    };

    const setActiveTask = (target) => {
      selectorCards.forEach((card) => {
        const isActive = card.getAttribute("data-task-target") === target;
        card.classList.toggle("is-active", isActive);
        card.classList.toggle("is-inactive", !isActive);
        card.setAttribute("aria-current", isActive ? "true" : "false");
      });

      mediaPanels.forEach((panel) => {
        const isActive = panel.getAttribute("data-task-media") === target;
        const video = panel.querySelector("video");
        panel.classList.toggle("is-active", isActive);
        panel.classList.toggle("is-inactive", !isActive);
        if (!video) return;
        if (shouldAutoplay) playTaskVideo(video);
      });
    };

    const initialCard = selectorCards.find((card) => card.classList.contains("is-active")) || selectorCards[0];
    if (initialCard) setActiveTask(initialCard.getAttribute("data-task-target"));

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        const target = trigger.getAttribute("data-task-target");
        const clickedActiveVideo = trigger.classList.contains("is-active")
          && event.target instanceof Element
          && Boolean(event.target.closest("video"));
        if (!target || clickedActiveVideo) return;
        setActiveTask(target);
      });

      if (trigger.tagName !== "BUTTON") {
        trigger.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          const target = trigger.getAttribute("data-task-target");
          if (target) setActiveTask(target);
        });
      }
    });
  }
}

async function loadVideoManifest() {
  if (window.location.protocol === "file:") {
    return new Set(
      Array.from(document.querySelectorAll("[data-video]"))
        .map((placeholder) => placeholder.getAttribute("data-video"))
        .filter(Boolean)
    );
  }

  try {
    const response = await fetch("assets/videos/manifest.json");
    if (!response.ok) return new Set();
    const manifest = await response.json();
    return new Set(Array.isArray(manifest.available) ? manifest.available : []);
  } catch {
    return new Set();
  }
}

function applyDeclaredVideoAspect(placeholder) {
  const declaredAspect = placeholder.getAttribute("data-aspect");
  if (!declaredAspect) return;
  placeholder.style.setProperty("--video-aspect", declaredAspect);
}

function syncVideoAspect(placeholder, video) {
  if (!video.videoWidth || !video.videoHeight) return;
  placeholder.style.setProperty("--video-aspect", `${video.videoWidth} / ${video.videoHeight}`);
}

function isLocalHttpPreview() {
  return window.location.protocol === "http:"
    && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
}

function getActiveVideoPreload() {
  return isLocalHttpPreview() ? "none" : "metadata";
}

function getInitialVideoPreload(placeholder) {
  const switcherPanel = placeholder.closest(".switcher-panel");
  if (switcherPanel && !switcherPanel.classList.contains("is-active")) return "none";

  const taskPanel = placeholder.closest(".task-video-panel");
  if (taskPanel && taskPanel.classList.contains("is-inactive")) return "none";

  return getActiveVideoPreload();
}

function createVideoAnnotation(placeholder) {
  const marker = placeholder.getAttribute("data-marker");
  const note = placeholder.getAttribute("data-note");
  if (!marker && !note) return null;

  const annotation = document.createElement("div");
  annotation.className = "video-annotation";

  if (marker) {
    const markerElement = document.createElement("span");
    markerElement.className = "video-marker";
    markerElement.textContent = marker;
    annotation.appendChild(markerElement);
  }

  if (note) {
    const noteElement = document.createElement("span");
    noteElement.className = "video-note";
    noteElement.textContent = note;
    annotation.appendChild(noteElement);
  }

  return annotation;
}

async function initVideoPlaceholders() {
  const availableVideos = await loadVideoManifest();
  const placeholders = Array.from(document.querySelectorAll("[data-video]"));
  for (const placeholder of placeholders) {
    const src = placeholder.getAttribute("data-video");
    const isMarkedReady = placeholder.hasAttribute("data-video-ready");
    applyDeclaredVideoAspect(placeholder);
    if (!src || (!isMarkedReady && !availableVideos.has(src))) continue;

    const label = placeholder.getAttribute("aria-label") || "Robo-ValueRL video";
    const annotation = createVideoAnnotation(placeholder);
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = getInitialVideoPreload(placeholder);
    video.setAttribute("aria-label", label.replace("placeholder", "").trim());
    video.addEventListener("loadedmetadata", () => syncVideoAspect(placeholder, video));
    video.src = src;

    if (placeholder.hasAttribute("data-direct-autoplay") && !reduceMotion) {
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.preload = "auto";
      video.addEventListener("canplay", () => video.play().catch(() => {}), { once: true });
    }

    placeholder.textContent = "";
    placeholder.classList.add("has-video");
    placeholder.removeAttribute("role");
    placeholder.appendChild(video);
    if (annotation) placeholder.appendChild(annotation);
  }
}

initCitationCopy();
initReveals();
initVideoPlaceholders().then(() => {
  initVideoSwitchers();
  initTaskShowcase();
});
