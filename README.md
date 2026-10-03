# AURELIS — Chronos 01

An original luxury-watch website and scroll-driven animation.

## What changed

The original project depended on a 144-frame JPG sequence. This version replaces that dependency with a **brand-new real-time Canvas animation**.

### Scroll story

1. **The Timepiece** — the complete watch is visible immediately.
2. **Rotation + Opening** — the case begins to turn as the watch opens.
3. **Mechanical Heart** — case, bezel, dial, hands and movement separate into an exploded view.
4. **Reassembly** — the parts smoothly travel back together.
5. **Perfectly Closed** — the original watch returns to the hero state.

Scrolling upward reverses the same animation naturally.

## Files

- `index.html` — page and content
- `styles.css` — responsive luxury visual system
- `script.js` — real-time watch drawing and scroll animation

The old `assets/frames` folder can remain in the repository, but the new experience does not require those frames.

## Run

Open `index.html` in a modern browser or deploy the repository as a static site.
