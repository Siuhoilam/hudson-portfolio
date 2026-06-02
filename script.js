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
});
