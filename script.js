(() => {
  const FRAME_COUNT = 144;
  const FRAME_PATH = i => `assets/frames/frame_${String(i + 1).padStart(6, "0")}.jpg`;
  const hero = document.querySelector(".hero-scroll");
  const canvas = document.querySelector("#watchCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const progressBar = document.querySelector("#progressBar");
  const progressPercent = document.querySelector("#progressPercent");
  const caption = document.querySelector("#stageCaption");
  const loading = document.querySelector("#loading");
  const loadingText = document.querySelector("#loadingText");
  const hint = document.querySelector("#scrollHintText");
  const frames = new Array(FRAME_COUNT);
  let loaded = 0, target = 0, current = 0, displayed = -1, raf = 0;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if (displayed >= 0) drawFrame(displayed);
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0,0,w,h);
    const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w-dw)/2, (h-dh)/2, dw, dh);
    displayed = index;
  }

  function loadFrame(i) {
    return new Promise(resolve => {
      const img = new Image();
      img.decoding = "async";
      img.src = FRAME_PATH(i);
      img.onload = async () => {
        try { await img.decode(); } catch {}
        frames[i] = img; loaded++;
        loadingText.textContent = Math.round(loaded / FRAME_COUNT * 100) + "%";
        resolve();
      };
      img.onerror = () => resolve();
    });
  }

  async function preload() {
    const concurrency = 8;
    let cursor = 0;
    async function worker() {
      while (cursor < FRAME_COUNT) {
        const i = cursor++;
        await loadFrame(i);
      }
    }
    await Promise.all(Array.from({length: concurrency}, worker));
    loading.style.opacity = "0";
    setTimeout(() => loading.remove(), 600);
    drawFrame(0);
  }

  function getProgress() {
    const r = hero.getBoundingClientRect();
    return Math.max(0, Math.min(1, -r.top / Math.max(1, hero.offsetHeight - innerHeight)));
  }

  const smooth = t => t*t*(3-2*t);
  function render() {
    current += (target-current) * 0.105;
    const p = current;
    const index = Math.min(FRAME_COUNT - 1, Math.round(smooth(p) * (FRAME_COUNT - 1)));
    if (index !== displayed) drawFrame(index);

    const pct = Math.round(p * 100);
    progressBar.style.height = pct + "%";
    progressPercent.textContent = pct;
    if (p < .25) caption.innerHTML = "<span>01</span> ASSEMBLED FORM";
    else if (p < .5) caption.innerHTML = "<span>02</span> ROTATION";
    else if (p < .78) caption.innerHTML = "<span>03</span> MECHANICAL REVEAL";
    else caption.innerHTML = "<span>04</span> FULL DETAIL";
    hint.textContent = p > .92 ? "Experience complete" : "Scroll to explore";

    if (Math.abs(target-current) > .0005) raf = requestAnimationFrame(render);
    else raf = 0;
  }

  function onScroll() {
    target = getProgress();
    if (!raf) raf = requestAnimationFrame(render);
  }

  addEventListener("scroll", onScroll, {passive:true});
  addEventListener("resize", resizeCanvas);
  resizeCanvas();
  onScroll();
  preload();
})();