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
