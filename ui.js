document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const behavior = () => reducedMotion.matches ? "instant" : "smooth";
  const icon = (name) => {
    const image = new Image(18, 18);
    image.src = `assets/icons/${name}.svg`;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    return image;
  };
  const control = (label, name, action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-button";
    button.setAttribute("aria-label", label);
    button.dataset.tooltip = label;
    button.append(icon(name));
    if (action) button.addEventListener("click", action);
    return button;
  };
  const tooltip = document.createElement("div");
  tooltip.className = "ui-tooltip";
  tooltip.id = "ui-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  document.body.append(tooltip);
  let tooltipOwner;
  const hideTooltip = () => {
    tooltipOwner?.removeAttribute("aria-describedby");
    tooltipOwner = null;
    tooltip.hidden = true;
  };
  const showTooltip = (element) => {
    hideTooltip();
    if (!element?.dataset.tooltip) return;
    tooltipOwner = element;
    tooltip.textContent = element.dataset.tooltip;
    element.setAttribute("aria-describedby", tooltip.id);
    tooltip.hidden = false;
    const rect = element.getBoundingClientRect();
    const width = tooltip.offsetWidth;
    const x = Math.max(8, Math.min(rect.left + rect.width / 2 - width / 2, innerWidth - width - 8));
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${Math.min(rect.bottom + 8, innerHeight - tooltip.offsetHeight - 8)}px`;
  };
  document.addEventListener("pointerover", (event) => showTooltip(event.target.closest("[data-tooltip]")));
  document.addEventListener("pointerout", (event) => {
    if (tooltipOwner && !tooltipOwner.contains(event.relatedTarget)) hideTooltip();
  });
  document.addEventListener("focusin", (event) => showTooltip(event.target.closest("[data-tooltip]")));
  document.addEventListener("focusout", hideTooltip);
  window.addEventListener("resize", hideTooltip);

  const nav = document.querySelector("#site-nav");
  const menuButton = document.querySelector(".menu-toggle");
  const header = document.querySelector(".site-header");
  const scrim = document.createElement("button");
  scrim.className = "nav-scrim";
  scrim.type = "button";
  scrim.tabIndex = -1;
  scrim.setAttribute("aria-label", "關閉導覽");
  scrim.hidden = true;
  header.after(scrim);
  const mobile = matchMedia("(max-width: 900px)");
  const setMenu = (open, restoreFocus = false) => {
    nav.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "關閉導覽" : "開啟導覽");
    menuButton.replaceChildren(icon(open ? "x" : "menu"));
    document.body.classList.toggle("has-nav", open);
    document.querySelector("main").inert = open;
    document.querySelector("footer").inert = open;
    scrim.hidden = !open;
    if (open) nav.querySelector("a")?.focus();
    else if (restoreFocus) menuButton.focus();
  };
  menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true", true));
  scrim.addEventListener("click", () => setMenu(false, true));
  mobile.addEventListener("change", () => setMenu(false));
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    setMenu(false);
    const target = document.querySelector(link.hash);
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }));
  header.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !document.body.classList.contains("has-nav")) return;
    const elements = [menuButton, ...nav.querySelectorAll("a")];
    const first = elements[0];
    const last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = [...document.querySelectorAll("[data-nav-section]")];
  const markSection = () => {
    const line = header.getBoundingClientRect().height + 160;
    const active = sections.filter((section) => section.getBoundingClientRect().top <= line).at(-1);
    sectionLinks.forEach((link) => {
      if (active && link.hash === `#${active.id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  const sectionObserver = new IntersectionObserver(markSection, {
    rootMargin: "-80px 0px -60% 0px", threshold: [0, 0.25, 0.5, 1]
  });
  sections.forEach((section) => sectionObserver.observe(section));
  const hero = document.querySelector(".hero");
  const topButton = control("返回頂部", "arrow-up", () => {
    document.querySelector(".brand").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: behavior() });
  });
  topButton.classList.add("back-to-top");
  topButton.hidden = true;
  document.body.append(topButton);
  new IntersectionObserver(([entry]) => {
    topButton.hidden = entry.isIntersecting;
    header.classList.toggle("is-scrolled", !entry.isIntersecting);
    markSection();
  }).observe(hero);

  const timeline = document.querySelector(".timeline");
  const timelineList = document.createElement("ol");
  timelineList.className = "timeline-list";
  timeline.querySelectorAll("article").forEach((article) => {
    const item = document.createElement("li");
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const time = article.querySelector("time");
    const copy = article.querySelector("div");
    const description = copy.querySelector("p:not(.role-line)");
    const label = document.createElement("div");
    label.append(copy.querySelector("h3"), copy.querySelector(".role-line"));
    const yearMonth = time.textContent.trim().match(/(\d{2})\/(\d{4})/);
    if (yearMonth) time.dateTime = `${yearMonth[2]}-${yearMonth[1]}`;
    summary.append(time, label, icon("chevron-down"));
    details.append(summary, description);
    item.append(details);
    timelineList.append(item);
  });
  timeline.replaceChildren(timelineList);

  const dialog = document.querySelector("#panel-modal");
  const frame = dialog.querySelector(".panel-frame");
  const loading = dialog.querySelector(".document-loading");
  const closeDocument = dialog.querySelector(".panel-close");
  const documentLinks = dialog.querySelectorAll(".document-open");
  let documentTrigger;
  let documentTimer;
  const syncScrollLock = () => document.body.classList.toggle("has-panel-modal", !!document.querySelector("dialog[open]"));
  document.querySelectorAll(".panel-button[data-pdf]").forEach((button) => {
    button.addEventListener("click", () => {
      documentTrigger = button;
      const pdf = button.dataset.pdf;
      dialog.querySelector("#panel-title").textContent = button.dataset.title;
      documentLinks.forEach((link) => { link.href = pdf; });
      loading.hidden = false;
      loading.textContent = "正在載入作品文件…";
      frame.setAttribute("aria-busy", "true");
      frame.src = pdf;
      dialog.showModal();
      syncScrollLock();
      closeDocument.focus();
      documentTimer = setTimeout(() => {
        loading.textContent = "文件載入較慢，可使用「另開 PDF」。";
        frame.setAttribute("aria-busy", "false");
      }, 12000);
    });
  });
  frame.addEventListener("load", () => {
    if (!frame.hasAttribute("src")) return;
    clearTimeout(documentTimer);
    loading.hidden = true;
    frame.setAttribute("aria-busy", "false");
  });
  closeDocument.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    clearTimeout(documentTimer);
    frame.removeAttribute("src");
    syncScrollLock();
    documentTrigger?.focus({ preventScroll: true });
  });
  const dismissOnBackdrop = (modal) => modal.addEventListener("click", (event) => {
    const rect = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) modal.close();
  });
  dismissOnBackdrop(dialog);

  const lightbox = document.createElement("dialog");
  lightbox.className = "image-dialog";
  lightbox.setAttribute("aria-label", "照片檢視器");
  const lightboxHeader = document.createElement("div");
  lightboxHeader.className = "document-header";
  const lightboxCaption = document.createElement("p");
  lightboxCaption.id = "image-caption";
  const lightboxActions = document.createElement("div");
  lightboxActions.className = "document-actions";
  const zoomButton = control("放大圖面", "maximize-2", () => {
    const zoomed = lightbox.classList.toggle("is-zoomed");
    zoomButton.setAttribute("aria-pressed", String(zoomed));
  });
  zoomButton.setAttribute("aria-pressed", "false");
  const photoClose = control("關閉照片", "x", () => lightbox.close());
  lightboxActions.append(zoomButton, photoClose);
  lightboxHeader.append(lightboxCaption, lightboxActions);
  const imageViewport = document.createElement("div");
  imageViewport.className = "image-viewport";
  const largeImage = new Image();
  const imageStatus = document.createElement("p");
  imageStatus.className = "image-status";
  imageStatus.setAttribute("role", "status");
  imageViewport.append(largeImage, imageStatus);
  const lightboxFooter = document.createElement("div");
  lightboxFooter.className = "image-controls";
  const imageCount = document.createElement("p");
  imageCount.setAttribute("aria-live", "polite");
  const photoPrevious = control("上一張照片", "chevron-left", () => showImage(imageIndex - 1));
  const photoNext = control("下一張照片", "chevron-right", () => showImage(imageIndex + 1));
  lightboxFooter.append(photoPrevious, imageCount, photoNext);
  lightbox.append(lightboxHeader, imageViewport, lightboxFooter);
  document.body.append(lightbox);
  dismissOnBackdrop(lightbox);
  let imageIndex = 0;
  let imageTrigger;
  const photos = [];
  const showImage = (index) => {
    imageIndex = Math.max(0, Math.min(index, photos.length - 1));
    const photo = photos[imageIndex];
    lightboxCaption.textContent = photo.caption;
    imageCount.textContent = `${imageIndex + 1} / ${photos.length}`;
    imageStatus.hidden = false;
    imageStatus.textContent = "正在載入照片…";
    largeImage.hidden = true;
    largeImage.alt = photo.alt;
    largeImage.src = photo.src;
    photoPrevious.disabled = imageIndex === 0;
    photoNext.disabled = imageIndex === photos.length - 1;
    lightbox.classList.remove("is-zoomed");
    zoomButton.setAttribute("aria-pressed", "false");
  };
  largeImage.addEventListener("load", () => { imageStatus.hidden = true; largeImage.hidden = false; });
  largeImage.addEventListener("error", () => { imageStatus.textContent = "無法載入照片，請稍後再試。"; });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); showImage(imageIndex - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); showImage(imageIndex + 1); }
  });
  lightbox.addEventListener("close", () => {
    syncScrollLock();
    imageTrigger?.focus({ preventScroll: true });
    hideTooltip();
  });
  document.querySelectorAll(".photo-wall figure").forEach((figure, index) => {
    const image = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    const originalLink = figure.closest("a");
    if (originalLink) {
      const article = document.createElement("a");
      article.href = originalLink.href;
      article.target = "_blank";
      article.rel = "noopener";
      article.textContent = caption.textContent;
      article.append(icon("arrow-up-right"));
      article.addEventListener("click", (event) => {
        if (!confirm("是否前往外部微信文章？")) event.preventDefault();
      });
      originalLink.replaceWith(figure);
      caption.replaceChildren(article);
    }
    photos.push({ src: image.src, alt: image.alt, caption: caption.textContent });
    const button = document.createElement("button");
    button.type = "button";
    button.className = "photo-open";
    button.setAttribute("aria-label", `放大：${image.alt}`);
    button.addEventListener("click", () => {
      imageTrigger = button;
      showImage(index);
      lightbox.showModal();
      syncScrollLock();
      photoClose.focus();
    });
    image.replaceWith(button);
    button.append(image);
  });

  // Shared carousel behavior: no autoplay and no vertical-wheel interception.
  const enhanceCarousel = (track, items, previous, next, label) => {
    const dots = document.createElement("div");
    dots.className = "slide-picker";
    dots.setAttribute("role", "group");
    dots.setAttribute("aria-label", `${label}位置`);
    track.after(dots);
    track.setAttribute("role", "region");
    track.setAttribute("aria-roledescription", "carousel");
    track.setAttribute("aria-label", label);
    previous.replaceChildren(icon("chevron-left"));
    next.replaceChildren(icon("chevron-right"));
    [previous, next].forEach((button) => { button.classList.add("icon-button"); button.dataset.tooltip = button.getAttribute("aria-label"); });
    const visible = () => items.filter((item) => !item.hidden);
    let active = 0;
    const go = (index) => {
      const list = visible();
      const item = list[Math.max(0, Math.min(index, list.length - 1))];
      if (item) track.scrollTo({ left: item.offsetLeft - list[0].offsetLeft, behavior: behavior() });
    };
    const update = () => {
      const list = visible();
      const left = track.getBoundingClientRect().left;
      let distance = Infinity;
      list.forEach((item, index) => {
        const delta = Math.abs(item.getBoundingClientRect().left - left);
        if (delta < distance) { distance = delta; active = index; }
      });
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (atEnd && list.length) active = list.length - 1;
      previous.disabled = !list.length || track.scrollLeft <= 4;
      next.disabled = !list.length || atEnd;
      [...dots.children].forEach((dot, index) => dot.setAttribute("aria-pressed", String(index === active)));
      items.forEach((item) => item.classList.toggle("is-active", item === list[active]));
    };
    const refresh = () => {
      const list = visible();
      dots.replaceChildren();
      list.forEach((item, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `${label} ${index + 1} / ${list.length}`);
        dot.addEventListener("click", () => go(index));
        dots.append(dot);
      });
      dots.hidden = list.length <= 1;
      track.scrollLeft = 0;
      requestAnimationFrame(update);
    };
    const step = (direction) => {
      const first = visible()[0];
      if (!first) return;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      track.scrollBy({ left: direction * (first.getBoundingClientRect().width + gap), behavior: behavior() });
    };
    previous.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    track.addEventListener("scroll", update, { passive: true });
    track.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        step(event.key === "ArrowRight" ? 1 : -1);
      }
    });
    new ResizeObserver(update).observe(track);
    refresh();
    return refresh;
  };
  const track = document.querySelector("[data-archive-track]");
  const cards = [...track.children];
  const refreshArchive = enhanceCarousel(track, cards, document.querySelector(".archive-control.prev"), document.querySelector(".archive-control.next"), "作品庫");
  const advisorTrack = document.querySelector("[data-advisor-track]");
  enhanceCarousel(advisorTrack, [...advisorTrack.children], document.querySelector(".advisor-control.prev"), document.querySelector(".advisor-control.next"), "導師與專業指導");
  document.querySelector(".advisor-progress").hidden = true;
  cards.forEach((card, index) => {
    card.dataset.category = index < 4 ? "design" : index === 4 ? "research" : "undergraduate";
    const category = card.querySelector("span");
    category.classList.add("project-tag");
  });
  const filters = document.querySelector(".archive-filters");
  const search = document.querySelector("#archive-query");
  const count = document.querySelector("#archive-results");
  const empty = document.querySelector(".archive-empty");
  let category = "all";
  const applyFilters = () => {
    const query = search.value.trim().toLocaleLowerCase();
    cards.forEach((card) => {
      card.hidden = (category !== "all" && card.dataset.category !== category) || !card.textContent.toLocaleLowerCase().includes(query);
    });
    const size = cards.filter((card) => !card.hidden).length;
    count.textContent = `${size} 個項目`;
    empty.hidden = size > 0;
    track.hidden = size === 0;
    filters.querySelectorAll("[data-filter]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === category)));
    refreshArchive();
  };
  filters.hidden = false;
  filters.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => { category = button.dataset.filter; applyFilters(); }));
  search.addEventListener("input", applyFilters);
  document.querySelector("[data-reset-filters]").addEventListener("click", () => { category = "all"; search.value = ""; applyFilters(); search.focus(); });

  const toast = document.querySelector(".ui-toast");
  let toastTimer;
  const notify = (message, duration = 1000) => {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), duration);
  };
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const previousFocus = document.activeElement;
      const fallback = () => {
        const field = document.createElement("textarea");
        field.value = button.dataset.copy;
        field.className = "clipboard-field";
        field.setAttribute("readonly", "");
        document.body.append(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        previousFocus?.focus({ preventScroll: true });
        if (!copied) throw new Error("Copy failed");
      };
      try {
        if (navigator.clipboard && window.isSecureContext) {
          try { await navigator.clipboard.writeText(button.dataset.copy); }
          catch { fallback(); }
        } else fallback();
        notify("Copied!");
      } catch { notify("未能複製，請手動選取聯絡資料。", 4000); }
    });
  });
  document.querySelectorAll(".icon-button[aria-label]").forEach((button) => { button.dataset.tooltip = button.getAttribute("aria-label"); });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    hideTooltip();
    if (document.body.classList.contains("has-nav")) setMenu(false, true);
    document.querySelector(".hero-companion-trigger[aria-expanded='true']")?.click();
  });
});
