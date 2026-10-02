(() => {
  const hero = document.querySelector('.hero-scroll');
  const assembled = document.querySelector('#assembled');
  const exploded = document.querySelector('#exploded');
  const progressBar = document.querySelector('#progressBar');
  const progressPercent = document.querySelector('#progressPercent');
  const stageCaption = document.querySelector('#stageCaption');

  let target = 0;
  let current = 0;
  let raf = 0;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => t * t * (3 - 2 * t);
  const lerp = (a,b,t) => a + (b-a)*t;

  function getProgress() {
    const rect = hero.getBoundingClientRect();
    const max = hero.offsetHeight - window.innerHeight;
    return clamp(-rect.top / max, 0, 1);
  }

  function render() {
    current = lerp(current, target, 0.085);
    const p = current;

    // Phase 1: premium assembled hero.
    const rotate = lerp(0, -80, ease(clamp(p / 0.42, 0, 1)));
    const assembledFade = 1 - ease(clamp((p - 0.42) / 0.18, 0, 1));
    const assembledScale = lerp(1, 0.93, ease(clamp(p / 0.55, 0, 1)));
    const xShift = lerp(0, -12, ease(clamp(p / 0.55, 0, 1)));

    assembled.style.transform =
      `translate3d(${xShift}%, 0, 0) rotateY(${rotate}deg) scale(${assembledScale})`;
    assembled.style.opacity = assembledFade;

    // Phase 2: exploded X-axis reveal.
    const e = ease(clamp((p - 0.42) / 0.42, 0, 1));
    const explodedScale = lerp(.82, 1, e);
    const explodedY = lerp(35, 0, e);
    exploded.style.transform =
      `translate3d(0, ${explodedY}px, 0) scale(${explodedScale})`;
    exploded.style.opacity = e;

    const pct = Math.round(p * 100);
    progressBar.style.height = `${pct}%`;
    progressPercent.textContent = pct;

    if (p < .28) {
      stageCaption.innerHTML = '<span>01</span> ASSEMBLED FORM';
    } else if (p < .55) {
      stageCaption.innerHTML = '<span>02</span> ROTATION';
    } else if (p < .88) {
      stageCaption.innerHTML = '<span>03</span> EXPLODED AXIS';
    } else {
      stageCaption.innerHTML = '<span>04</span> EVERY PART, VISIBLE';
    }

    if (Math.abs(target - current) > 0.0005) {
      raf = requestAnimationFrame(render);
    } else {
      raf = 0;
    }
  }

  function onScroll() {
    target = getProgress();
    if (!raf) raf = requestAnimationFrame(render);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
