document.addEventListener("DOMContentLoaded", () => {
  const companion = document.querySelector("[data-companion]");
  const companionTrigger = companion?.querySelector(".hero-companion-trigger");
  const companionNote = companion?.querySelector(".hero-companion-note");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const companionActions = ["glasses", "map", "magnifier"];
  const companionDurations = {
    wave: 2700,
    glasses: 2900,
    map: 3500,
    magnifier: 3100
  };
  let companionActionTimer = null;
  let companionActionEndTimer = null;
  let companionLastAction = "";
  let companionInView = true;

  const setCompanionNote = (open) => {
    if (!companion || !companionTrigger || !companionNote) return;
    companion.classList.toggle("is-chatting", open);
    companionTrigger.setAttribute("aria-expanded", String(open));
    companionNote.setAttribute("aria-hidden", String(!open));
  };

  const clearCompanionTimers = () => {
    window.clearTimeout(companionActionTimer);
    window.clearTimeout(companionActionEndTimer);
  };

  const resetCompanionAction = () => {
    clearCompanionTimers();
    if (!companion) return;
    companion.classList.remove("is-acting");
    delete companion.dataset.action;
  };

  const scheduleCompanionAction = () => {
    window.clearTimeout(companionActionTimer);
    if (!companion || reducedMotion.matches || document.hidden || !companionInView) return;
    const delay = 7000 + Math.round(Math.random() * 7000);
    companionActionTimer = window.setTimeout(() => {
      const choices = companionActions.filter((action) => action !== companionLastAction);
      const nextAction = choices[Math.floor(Math.random() * choices.length)];
      playCompanionAction(nextAction);
    }, delay);
  };

  const playCompanionAction = (action) => {
    if (!companion || reducedMotion.matches || companion.classList.contains("is-chatting")) {
      scheduleCompanionAction();
      return;
    }

    clearCompanionTimers();
    const duration = companionDurations[action] || 2900;
    companionLastAction = action;
    companion.style.setProperty("--action-duration", `${duration}ms`);
    companion.dataset.action = action;
    companion.classList.add("is-acting");

    companionActionEndTimer = window.setTimeout(() => {
      companion.classList.remove("is-acting");
      delete companion.dataset.action;
      scheduleCompanionAction();
    }, duration + 80);
  };

  if (companion && !reducedMotion.matches) {
    window.setTimeout(() => playCompanionAction("wave"), 650);

    const hero = companion.closest(".hero");
    if (hero && "IntersectionObserver" in window) {
      const companionObserver = new IntersectionObserver(([entry]) => {
        companionInView = entry.isIntersecting;
        if (companionInView) scheduleCompanionAction();
        else resetCompanionAction();
      }, { threshold: .2 });
      companionObserver.observe(hero);
    }
  }

  companionTrigger?.addEventListener("click", () => {
    const willOpen = !companion?.classList.contains("is-chatting");
    if (willOpen) resetCompanionAction();
    setCompanionNote(willOpen);
    if (!willOpen) scheduleCompanionAction();
  });

  companion?.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || event.pointerType === "touch") return;
    const bounds = companion.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) - .5;
    const y = ((event.clientY - bounds.top) / bounds.height) - .5;
    companion.style.setProperty("--companion-x", `${x * 5}px`);
    companion.style.setProperty("--companion-y", `${y * 3}px`);
  });

  companion?.addEventListener("pointerleave", () => {
    companion.style.setProperty("--companion-x", "0px");
    companion.style.setProperty("--companion-y", "0px");
  });

  document.addEventListener("click", (event) => {
    if (companion && !companion.contains(event.target)) {
      const wasOpen = companion.classList.contains("is-chatting");
      setCompanionNote(false);
      if (wasOpen) scheduleCompanionAction();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) resetCompanionAction();
    else scheduleCompanionAction();
  });

  const contactCompanion = document.querySelector("[data-contact-companion]");
  if (contactCompanion) {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      contactCompanion.classList.add("is-visible");
    } else {
      const contactCompanionObserver = new IntersectionObserver(([entry], observer) => {
        if (!entry.isIntersecting) return;
        contactCompanion.classList.add("is-visible");
        observer.unobserve(contactCompanion);
      }, { threshold: .35 });
      contactCompanionObserver.observe(contactCompanion);
    }
  }

});
