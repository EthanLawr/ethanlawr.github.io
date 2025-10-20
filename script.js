/* Intersection-based reveal */
const observer = new IntersectionObserver((entries)=>{
  for (const e of entries){
    if (e.isIntersecting){ e.target.classList.add('in'); observer.unobserve(e.target); }
  }
},{ threshold:.12 });
document.querySelectorAll('[data-animate]').forEach(el=>observer.observe(el));

/* Modal logic */
const MODAL = document.getElementById('modal');
const MODAL_TITLE = document.getElementById('modalTitle');
const MODAL_BODY = document.getElementById('modalBody');
// Modal (fix template string)
const modalOpen = (title, body) => {
  MODAL_TITLE.textContent = 'Experience';
  MODAL_BODY.innerHTML = `<strong>${title}</strong><br>${body}`;
  MODAL.setAttribute('aria-hidden','false');
  setTimeout(()=>{ document.querySelector('.modal-close').focus(); }, 10);
};
const modalClose = () => MODAL.setAttribute('aria-hidden','true');

MODAL.addEventListener('click', (e)=>{
  if (e.target.matches('[data-close]')) modalClose();
});
document.addEventListener('keydown',(e)=>{
  if (e.key === 'Escape' && MODAL.getAttribute('aria-hidden') === 'false') modalClose();
});

/* Skill descriptions for modal */
const skillCopy = {
  'Node.js': '7 years building scalable services, real-time systems, and resilient microservices. Developed Slate, a boilerplate and customizable Discord bot with modular plugin architecture. Created Ren (Solo Project), a feature-rich bot offering dynamic image manipulation, in-bot economy systems, and numerous utilities. This has required continuous deployment of features that include backend logic- real-time operations, and integrations with databases.',
  'Python': '2 years scripting, data tasks, and API services for developer velocity.',
  'Java': '3 University courses and 2 Highschool courses. Github Links:',
  'C#': '2 Highschool courses. This includes Console as well as WAPP programs.',
  'C': '1 year systems-level foundations and performance awareness.',
  'C++': '1 year performance-sensitive components and integrations.',
};

function handleItemActivate(el){
  const key = el.getAttribute('data-key');
  modalOpen(skillCopy[key], skillCopy[key] || 'Experienced across multiple stacks.');
}

// Click + keyboard activation
track.addEventListener('click', (e)=>{
  const item = e.target.closest('.slide');
  if (item) handleItemActivate(item);
});
track.addEventListener('keydown',(e)=>{
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('slide')){
    e.preventDefault();
    handleItemActivate(e.target);
  }
});
/* Pause marquee on pointer enter (already handled via CSS hover), but also on focus for keyboard users */
const carousel = document.querySelector('.slider');
carousel.addEventListener('focusin', ()=> track.style.animationPlayState = 'paused');
carousel.addEventListener('focusout', ()=> track.style.animationPlayState = 'running');

/* Touch optimization: prevent accidental horizontal scroll rubber-banding */
carousel.addEventListener('touchstart', ()=> { /* reserved for future swipe if desired */ }, {passive:true});
/* === Infinite, bidirectional, swipeable carousel with 5s pause === */
const slider = document.querySelector('.slider');
const track  = document.getElementById('slideTrack');

// Build 3 copies so we can wrap both left and right seamlessly
const originalsHTML = Array.from(track.children).map(li => li.outerHTML).join('');
const COPIES = 3;
track.innerHTML = originalsHTML.repeat(COPIES);

let singleSetWidth = 0;
function recalc() {
  // Each copy is identical; total width divides evenly by COPIES
  singleSetWidth = track.scrollWidth / COPIES;
}
recalc();

// Start in the middle copy so you can scroll left or right immediately
function goToMiddle(withinSetOffset = 0) {
  slider.scrollLeft = singleSetWidth + withinSetOffset;
}
goToMiddle(0);

// Keep position stable on resize
window.addEventListener('resize', () => {
  const ratio = (slider.scrollLeft % singleSetWidth) / singleSetWidth;
  recalc();
  goToMiddle(singleSetWidth * ratio);
});

/* ---- Autoscroll (JS, not CSS) ---- */
let pausedUntil = 0;
let last = performance.now();
const SPEED_PX_PER_MS = 0.08; // tweak speed here

function pause(ms = 5000) { pausedUntil = performance.now() + ms; }

// Keep you anchored in the middle copy when you drift too far
function normalizeIfOutOfBounds(force = false) {
  if (!singleSetWidth) return;
  const L = slider.scrollLeft;
  if (force || L < singleSetWidth * 0.5 || L > singleSetWidth * 1.5) {
    const offset = L % singleSetWidth;
    goToMiddle(offset);
  }
}

function tick(now) {
  const dt = now - last;
  last = now;

  if (now >= pausedUntil) {
    slider.scrollLeft += SPEED_PX_PER_MS * dt;
    normalizeIfOutOfBounds();
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ---- User interactions: allow sideways scroll + pause for 5s ---- */
// Wheel / touch scroll automatically pauses
slider.addEventListener('scroll', () => {
  // If user hits the ends, wrap to middle seamlessly
  if (slider.scrollLeft <= 2)      normalizeIfOutOfBounds(true);
  if (slider.scrollLeft >= (singleSetWidth * 2) - 2) normalizeIfOutOfBounds(true);
  pause();
}, { passive: true });

slider.addEventListener('wheel', () => pause(), { passive: true });
slider.addEventListener('touchstart', () => pause(), { passive: true });
slider.addEventListener('touchmove', () => pause(), { passive: true });
slider.addEventListener('touchend', () => pause(), { passive: true });

// Click-and-drag horizontal scrolling (mouse/pointer)
let down = false, startX = 0, startLeft = 0;
slider.addEventListener('pointerdown', (e) => {
  down = true;
  slider.setPointerCapture(e.pointerId);
  startX = e.clientX;
  startLeft = slider.scrollLeft;
  pause();
});
slider.addEventListener('pointermove', (e) => {
  if (!down) return;
  const dx = e.clientX - startX;
  slider.scrollLeft = startLeft - dx;
});
slider.addEventListener('pointerup', (e) => {
  if (!down) return;
  down = false;
  slider.releasePointerCapture(e.pointerId);
  pause();
});

// Clicking a slide also pauses (feels natural)
track.addEventListener('click', () => pause());