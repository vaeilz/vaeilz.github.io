// 1.js - fixed cumulative turbo spin + glitch + non-conflicting glow
document.addEventListener('DOMContentLoaded', () => {
  const neuro = document.getElementById('neuro-corner');
  if (!neuro) {
    console.warn('Neuro image (#neuro-corner) not found.');
    return;
  }

  // ensure CSS keyframe doesn't fight JS transforms
  neuro.style.animation = 'none';
  neuro.style.webkitAnimation = 'none';

  // --- helpers ---
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // --- config ---
  const baseSpeed = 0.6;       // degrees per frame idle
  const multiplier = 2;        // multiply target each click
  const maxSpeed = 60;         // cap before reset
  const smoothing = 0.08;      // lerp factor
  const glowBase = 8;          // base px for glow

  // --- state ---
  let angle = 0;
  let currentSpeed = baseSpeed;
  let targetSpeed = baseSpeed;

  // --- bubble (offset so it won't overlap neuro) ---
  const bubble = document.createElement('div');
  bubble.id = 'neuro-bubble';
  Object.assign(bubble.style, {
    position: 'fixed',
    right: '180px',
    bottom: '170px',
    padding: '8px 12px',
    background: 'rgba(255,102,204,0.12)',
    border: '1px solid #ff66cc',
    borderRadius: '8px',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '0.62rem',
    color: '#ffccff',
    opacity: '0',
    pointerEvents: 'none',
    transform: 'translateY(10px)',
    transition: 'opacity 0.25s linear, transform 0.25s linear'
  });
  document.body.appendChild(bubble);

  function speak(text) {
    bubble.textContent = text;
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateY(0)';
    setTimeout(() => {
      bubble.style.opacity = '0';
      bubble.style.transform = 'translateY(10px)';
    }, 1400);
  }

  // --- helper: set glow via CSS var so CSS animations can override 'filter' ---
  function setNeuroGlow(px) {
    neuro.style.setProperty('--neuro-glow', `${px}px`);
  }

  // initialize glow var
  setNeuroGlow(glowBase);

  // --- animation loop ---
  let lastTime = null;
  function animate(now) {
    if (!lastTime) lastTime = now;
    const delta = now - lastTime;
    lastTime = now;

    // smooth toward target
    currentSpeed = lerp(currentSpeed, targetSpeed, smoothing);

    // apply angle (notice we use angle accumulator and write transform once)
    angle = (angle + currentSpeed) % 360;
    neuro.style.transform = `rotate(${angle}deg)`;

    // scale glow with targetSpeed (but don't write filter directly)
    const glowFactor = clamp(1 + targetSpeed / 15, 1, 6);
    setNeuroGlow(glowBase * glowFactor);

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // --- click behavior: cumulative turbo, reset when over cap ---
  neuro.addEventListener('click', () => {
    targetSpeed *= multiplier;

    if (targetSpeed >= maxSpeed) {
      // play glitch (CSS animation) and reset to base
      triggerGlitch();
      speak('Resetting... dizzy 🤖');

      // temporarily set a cyan glow by changing the var, then restore
      setNeuroGlow(glowBase * 2);
      setTimeout(() => setNeuroGlow(glowBase), 700);

      targetSpeed = baseSpeed;
      return;
    }

    // normal accelerate feedback
    const msgs = ['Turbo!', 'Faster...', 'Spin up!', 'Engage!'];
    speak(msgs[Math.floor(Math.random() * msgs.length)]);
  });

  // --- glitch trigger function: toggles .glitch and removes after animation ---
  function triggerGlitch() {
    neuro.classList.add('glitch');
    function onEnd() {
      neuro.classList.remove('glitch');
      neuro.removeEventListener('animationend', onEnd);
    }
    neuro.addEventListener('animationend', onEnd);
  }

  // --- optional: cursor spotlight CSS variables (already in your CSS)
  document.addEventListener('mousemove', e => {
    document.body.style.setProperty('--x', `${e.clientX}px`);
    document.body.style.setProperty('--y', `${e.clientY}px`);
  });

  // Expose trigger for debugging in console if you want
  window._neuroTriggerGlitch = triggerGlitch;
});


document.querySelectorAll('.gallery-grid img').forEach(img => {
  img.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = `<img src="${img.src}">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  });
});
