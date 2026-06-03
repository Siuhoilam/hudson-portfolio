document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let activeSlide = 0;
  let slideTimer = null;

  const showSlide = (index) => {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeSlide;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
  };

  const startCarousel = () => {
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(() => {
      showSlide(activeSlide + 1);
    }, 6000);
  };

  if (hero && slides.length && dots.length) {
    hero.classList.add("is-interactive");
    showSlide(0);
    startCarousel();

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const nextIndex = Number(dot.dataset.slide || 0);
        showSlide(nextIndex);
        startCarousel();
      });
    });
  }

  const toast = document.querySelector(".copy-toast");
  let toastTimer = null;

  const fallbackCopy = (value) => {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  };

  const showToast = () => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1000);
  };

  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy || button.textContent.trim();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          fallbackCopy(value);
        }
        showToast();
      } catch {
        fallbackCopy(value);
        showToast();
      }
    });
  });

  document.querySelectorAll("video[data-video-src]").forEach(async (video) => {
    const src = video.dataset.videoSrc;
    if (!src || video.querySelector("source") || window.location.protocol === "file:") return;

    try {
      const response = await fetch(src, { method: "HEAD" });
      if (!response.ok) return;

      const source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);
      video.load();
      video.closest(".featured-media")?.classList.add("has-video");
    } catch {
      // Keep the poster visible when the compressed video has not been uploaded yet.
    }
  });

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const previous = carousel.querySelector(".carousel-control.prev");
    const next = carousel.querySelector(".carousel-control.next");
    if (!track || !previous || !next) return;

    const scrollByPage = (direction) => {
      track.scrollBy({
        left: direction * track.clientWidth,
        behavior: "smooth",
      });
    };

    previous.addEventListener("click", () => scrollByPage(-1));
    next.addEventListener("click", () => scrollByPage(1));
  });

  const openConfirmedLink = (element) => {
    const url = element.dataset.confirmUrl;
    if (!url) return;
    const label = element.dataset.confirmLabel || "外部連結";
    const confirmed = window.confirm(`是否前往「${label}」？`);
    if (confirmed) {
      window.open(url, "_blank", "noopener");
    }
  };

  document.querySelectorAll("[data-confirm-url]").forEach((element) => {
    element.addEventListener("click", () => openConfirmedLink(element));
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openConfirmedLink(element);
      }
    });
  });

  const panelModal = document.querySelector("#panel-modal");
  const panelFrame = panelModal?.querySelector(".panel-frame");
  const panelTitle = panelModal?.querySelector("#panel-title");
  const panelClose = panelModal?.querySelector(".panel-close");

  const closePanel = () => {
    if (!panelModal || !panelFrame) return;
    panelModal.classList.remove("is-open");
    panelModal.setAttribute("aria-hidden", "true");
    panelFrame.removeAttribute("src");
    document.body.classList.remove("has-panel-modal");
  };

  document.querySelectorAll(".panel-button[data-pdf]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!panelModal || !panelFrame) return;
      const pdf = button.dataset.pdf;
      if (!pdf) return;

      panelFrame.src = pdf;
      if (panelTitle) panelTitle.textContent = button.dataset.title || "Portfolio Preview";
      panelModal.classList.add("is-open");
      panelModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-panel-modal");
      panelClose?.focus();
    });
  });

  panelClose?.addEventListener("click", closePanel);

  panelModal?.addEventListener("click", (event) => {
    if (event.target === panelModal) closePanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panelModal?.classList.contains("is-open")) {
      closePanel();
    }
  });
});
