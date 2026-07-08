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
    const setActivePanel = (target) => {
      const activeIndex = Math.max(0, panels.findIndex((panel) => panel.getAttribute("data-panel-id") === target));
      const previousIndex = (activeIndex - 1 + panels.length) % panels.length;
      const nextIndex = (activeIndex + 1) % panels.length;

      tabs.forEach((item) => {
        const isActive = item.getAttribute("data-panel") === target;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-current", isActive ? "true" : "false");
      });

      panels.forEach((panel, index) => {
        panel.classList.toggle("is-active", index === activeIndex);
        panel.classList.toggle("is-prev", index === previousIndex);
        panel.classList.toggle("is-next", index === nextIndex);
      });
    };

    const initial = tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];
    if (initial) setActivePanel(initial.getAttribute("data-panel"));

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setActivePanel(tab.getAttribute("data-panel"));
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

    const setActiveTask = (target, shouldPlay) => {
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
        if (!isActive) {
          video.pause();
          return;
        }
        if (shouldPlay) video.play().catch(() => {});
      });
    };

    const initialCard = selectorCards.find((card) => card.classList.contains("is-active")) || selectorCards[0];
    if (initialCard) setActiveTask(initialCard.getAttribute("data-task-target"), false);

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        const target = trigger.getAttribute("data-task-target");
        const clickedActiveVideo = trigger.classList.contains("is-active")
          && event.target instanceof Element
          && Boolean(event.target.closest("video"));
        if (!target || clickedActiveVideo) return;
        setActiveTask(target, true);
      });

      if (trigger.tagName !== "BUTTON") {
        trigger.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          const target = trigger.getAttribute("data-task-target");
          if (target) setActiveTask(target, true);
        });
      }
    });
  }
}

async function loadVideoManifest() {
  if (window.location.protocol === "file:") return new Set();

  try {
    const response = await fetch("assets/videos/manifest.json");
    if (!response.ok) return new Set();
    const manifest = await response.json();
    return new Set(Array.isArray(manifest.available) ? manifest.available : []);
  } catch {
    return new Set();
  }
}

async function initVideoPlaceholders() {
  const availableVideos = await loadVideoManifest();
  const placeholders = Array.from(document.querySelectorAll("[data-video]"));
  for (const placeholder of placeholders) {
    const src = placeholder.getAttribute("data-video");
    const isMarkedReady = placeholder.hasAttribute("data-video-ready");
    if (!src || (!isMarkedReady && !availableVideos.has(src))) continue;

    const label = placeholder.getAttribute("aria-label") || "Robo-ValueRL video";
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", label.replace("placeholder", "").trim());
    video.src = src;

    placeholder.textContent = "";
    placeholder.classList.add("has-video");
    placeholder.removeAttribute("role");
    placeholder.appendChild(video);
  }
}

initCitationCopy();
initReveals();
initVideoSwitchers();
initVideoPlaceholders().then(initTaskShowcase);
