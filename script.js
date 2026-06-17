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
