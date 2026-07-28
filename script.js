document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  menuButton?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open") || false;
    menuButton.setAttribute("aria-expanded", String(open));
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

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

  const archiveTrack = document.querySelector("[data-archive-track]");
  const archivePrevious = document.querySelector(".archive-control.prev");
  const archiveNext = document.querySelector(".archive-control.next");

  const scrollArchive = (direction) => {
    if (!archiveTrack) return;
    const card = archiveTrack.querySelector(".archive-card");
    const distance = card ? card.getBoundingClientRect().width + 16 : archiveTrack.clientWidth * 0.8;
    archiveTrack.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  archivePrevious?.addEventListener("click", () => scrollArchive(-1));
  archiveNext?.addEventListener("click", () => scrollArchive(1));
  archiveTrack?.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    archiveTrack.scrollLeft += event.deltaY;
  }, { passive: false });

  const advisorTrack = document.querySelector("[data-advisor-track]");
  const advisorPrevious = document.querySelector(".advisor-control.prev");
  const advisorNext = document.querySelector(".advisor-control.next");
  const advisorProgress = document.querySelector(".advisor-progress span");
  const advisorOriginalSlides = advisorTrack ? [...advisorTrack.querySelectorAll(".advisor-slide")] : [];
  const advisorRealCount = advisorOriginalSlides.length;
  let advisorAutoTimer = null;
  let advisorResetTimer = null;
  let advisorActiveIndex = advisorRealCount > 1 ? 1 : 0;

  const createAdvisorClone = (slide) => {
    const clone = slide.cloneNode(true);
    clone.classList.add("is-clone");
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a, button").forEach((element) => {
      element.setAttribute("tabindex", "-1");
    });
    return clone;
  };

  if (advisorTrack && advisorRealCount > 1) {
    advisorTrack.prepend(createAdvisorClone(advisorOriginalSlides[advisorRealCount - 1]));
    advisorTrack.append(createAdvisorClone(advisorOriginalSlides[0]));
  }

  const getAdvisorSlides = () => advisorTrack ? [...advisorTrack.querySelectorAll(".advisor-slide")] : [];

  const getAdvisorSlideLeft = (slide) => (
    slide.offsetLeft - ((advisorTrack.clientWidth - slide.clientWidth) / 2)
  );

  const scrollAdvisorToIndex = (index, behavior = "smooth") => {
    if (!advisorTrack) return;
    const slides = getAdvisorSlides();
    const slide = slides[index];
    if (!slide) return;
    advisorActiveIndex = index;
    advisorTrack.scrollTo({ left: getAdvisorSlideLeft(slide), behavior });
  };

  const normalizeAdvisorLoop = () => {
    if (!advisorTrack || advisorRealCount <= 1) return;
    window.clearTimeout(advisorResetTimer);
    advisorResetTimer = window.setTimeout(() => {
      if (advisorActiveIndex === 0) {
        scrollAdvisorToIndex(advisorRealCount, "auto");
      } else if (advisorActiveIndex === advisorRealCount + 1) {
        scrollAdvisorToIndex(1, "auto");
      }
      updateAdvisorViewport();
    }, 420);
  };

  const updateAdvisorViewport = () => {
    if (!advisorTrack) return;

    const slides = [...advisorTrack.querySelectorAll(".advisor-slide")];
    const trackRect = advisorTrack.getBoundingClientRect();
    const viewportCenter = trackRect.left + trackRect.width / 2;
    let activeIndex = 0;
    let closestDistance = Infinity;

    slides.forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const slideCenter = slideRect.left + slideRect.width / 2;
      const distance = Math.abs(slideCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });

    advisorActiveIndex = activeIndex;
    let realIndex = advisorRealCount > 1 ? activeIndex - 1 : activeIndex;
    if (activeIndex === 0) realIndex = advisorRealCount - 1;
    if (activeIndex === advisorRealCount + 1) realIndex = 0;
    if (advisorProgress && advisorRealCount > 1) {
      const progress = realIndex / (advisorRealCount - 1);
      advisorProgress.style.transform = `translateX(${progress * 500}%)`;
    }

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeIndex);
      slide.classList.toggle("is-nearby", Math.abs(index - activeIndex) === 1);
    });

    normalizeAdvisorLoop();
  };

  const scrollAdvisor = (direction) => {
    if (!advisorTrack) return;
    scrollAdvisorToIndex(advisorActiveIndex + direction);
  };

  const stopAdvisorAuto = () => {
    if (advisorAutoTimer) window.clearInterval(advisorAutoTimer);
    advisorAutoTimer = null;
  };

  const startAdvisorAuto = () => {
    if (!advisorTrack || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stopAdvisorAuto();
    advisorAutoTimer = window.setInterval(() => {
      scrollAdvisor(1);
    }, 5200);
  };

  const restartAdvisorAuto = () => {
    stopAdvisorAuto();
    startAdvisorAuto();
  };

  advisorPrevious?.addEventListener("click", () => {
    scrollAdvisor(-1);
    restartAdvisorAuto();
  });
  advisorNext?.addEventListener("click", () => {
    scrollAdvisor(1);
    restartAdvisorAuto();
  });
  advisorTrack?.addEventListener("scroll", updateAdvisorViewport, { passive: true });
  advisorTrack?.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    advisorTrack.scrollLeft += event.deltaY;
    restartAdvisorAuto();
  }, { passive: false });
  advisorTrack?.addEventListener("mouseenter", stopAdvisorAuto);
  advisorTrack?.addEventListener("mouseleave", startAdvisorAuto);
  advisorTrack?.addEventListener("focusin", stopAdvisorAuto);
  advisorTrack?.addEventListener("focusout", startAdvisorAuto);
  window.addEventListener("resize", () => {
    scrollAdvisorToIndex(advisorActiveIndex, "auto");
    updateAdvisorViewport();
  });
  window.requestAnimationFrame(() => {
    scrollAdvisorToIndex(advisorRealCount > 1 ? 1 : 0, "auto");
    updateAdvisorViewport();
  });
  startAdvisorAuto();

  const modal = document.querySelector("#panel-modal");
  const frame = modal?.querySelector(".panel-frame");
  const title = modal?.querySelector("#panel-title");
  const closeButton = modal?.querySelector(".panel-close");
  let returnFocus = null;

  const closeModal = () => {
    if (!modal || !frame) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    frame.removeAttribute("src");
    document.body.classList.remove("has-panel-modal");
    returnFocus?.focus();
  };

  document.querySelectorAll(".panel-button[data-pdf]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!modal || !frame) return;
      returnFocus = button;
      frame.src = button.dataset.pdf || "";
      if (title) title.textContent = button.dataset.title || "Portfolio preview";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-panel-modal");
      closeButton?.focus();
    });
  });

  closeButton?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
  });
});
