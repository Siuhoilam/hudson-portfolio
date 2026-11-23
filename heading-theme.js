document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const storageKey = "hudson-background-motion";
  let paused = false;
  try { paused = localStorage.getItem(storageKey) === "paused"; } catch { /* Storage is optional for local-file previews. */ }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "background-motion-control";
  const image = new Image(18, 18);
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  button.append(image);
  document.body.append(button);

  const sync = () => {
    const stopped = paused || reducedMotion.matches;
    document.body.classList.toggle("is-background-paused", stopped || document.hidden);
    button.disabled = reducedMotion.matches;
    const label = reducedMotion.matches
      ? "已依系統設定停用動態背景"
      : stopped ? "播放背景動畫" : "暫停背景動畫";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.dataset.tooltip = label;
    button.dataset.paused = String(stopped);
    image.src = stopped ? "assets/icons/play.svg" : "assets/icons/pause.svg";
  };

  button.addEventListener("click", () => {
    paused = !paused;
    try { localStorage.setItem(storageKey, paused ? "paused" : "playing"); } catch { /* Keep the control usable without storage. */ }
    sync();
  });
  reducedMotion.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  sync();
});
