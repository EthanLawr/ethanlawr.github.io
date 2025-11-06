document.getElementById('year').textContent = new Date().getFullYear();

// Project links
const projectLinks = {
  slate: 'https://github.com/isahooman/Slate',
  renge: 'https://github.com/EthanLawr/Ren',
  guide: 'https://github.com/EthanLawr/Advanced-Programming-Cpp'
};

// Initialize project links
function initProjectLinks() {
  document.querySelectorAll('.github-btn').forEach(btn => {
    const project = btn.getAttribute('data-project');
    if (projectLinks[project]) {
      btn.href = projectLinks[project];
    }
  });
}

// --- Scroll based animation ---
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

// --- Modal system ---
const MODAL = document.getElementById('modal');
const MODAL_TITLE = document.getElementById('modalTitle');
const MODAL_BODY = document.getElementById('modalBody');

/* Skill descriptions for modal */
const skillDescriptions = {
  'Node.js': '7 years building scalable services, real-time systems, and resilient microservices. Developed Slate, a boilerplate and customizable Discord bot with modular plugin architecture. Created Ren (Solo Project), a feature-rich bot offering dynamic image manipulation, in-bot economy systems, and numerous utilities. This has required continuous deployment of features that include backend logic- real-time operations, and integrations with databases.',
  'Python': '2 years scripting, data tasks, and API services for developer velocity.',
  'Java': '3 University courses and 2 Highschool courses. Github Links:',
  'C#': '2 Highschool courses. This includes Console as well as WAPP programs.',
  'C': '1 year systems-level foundations and performance awareness.',
  'C++': '1 year performance-sensitive components and integrations.',
};

function openModal(title, body) {
  MODAL_TITLE.textContent = 'Experience';
  MODAL_BODY.innerHTML = `<strong>${title}</strong><br>${body}`;
  MODAL.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    document.querySelector('.modal-close').focus();
  }, 10);
}

function closeModal() {
  MODAL.setAttribute('aria-hidden', 'true');
}

function handleItemActivate(element) {
  const key = element.getAttribute('data-key');
  const description = skillDescriptions[key];
  openModal(key, description);
}

MODAL.addEventListener('click', (e) => {
  if (e.target.matches('[data-close]')) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && MODAL.getAttribute('aria-hidden') === 'false') {
    closeModal();
  }
});

// --- Carousel system ---
const track = document.getElementById('slideTrack');
const carousel = document.querySelector('.slider');

// Mouse distance to distinguish click from drag
const MOUSE_DRAG_THRESHOLD = 3;
// Touch movement threshold to start drag
const TOUCH_DRAG_THRESHOLD = 8;
// Time to distinguish tap from drag
const TAP_TIME_THRESHOLD = 300;

// Animation state
let currentOffset = 0;
let isHovered = false;
let animationId = null;

// Dragging state
let isDragging = false;
let hasMoved = false;
let recentlyDragged = false;
let isMouseInteraction = false;

// Position tracking
let startX = 0;
let startTime = 0;
let lastX = 0;
let lastTime = 0;

// Physics state
let velocity = 0;
let momentum = 0;

// Mouse state
let mouseStartX = 0;
let mouseStartY = 0;
let isMouseDown = false;
let mouseDragStarted = false;

function initCarousel() {
  const original = track.innerHTML;
  track.innerHTML = '';

  // Create 5 copies for seamless infinite scroll
  for (let i = 0; i < 5; i++) {
    const copy = document.createElement('div');
    copy.innerHTML = original;
    copy.style.display = 'contents';
    track.appendChild(copy);
  }

  // Center on the 3rd (middle) copy
  const setWidth = track.scrollWidth / 5;
  currentOffset = -setWidth * 2;
  track.style.transform = `translateX(${currentOffset}px)`;

  // Bind events to new slides
  document.querySelectorAll('.slide[data-key]').forEach(slide => {
    slide.addEventListener('click', () => {
      if (!recentlyDragged && !mouseDragStarted) handleItemActivate(slide);
    });

    slide.addEventListener('touchend', e => {
      e.stopPropagation();
    }, { passive: false });

    slide.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleItemActivate(slide);
      }
    });
  });

  startAnimation();
}

function animate() {
  const MOMENTUM_THRESHOLD = 0.1;
  const MOMENTUM_DECAY = 0.95;
  const HIGH_MOMENTUM_THRESHOLD = 2;
  const BOUNDARY_BUFFER = 100;
  const AUTO_SCROLL_SPEED = 0.5;

  // Auto-scroll when not being interacted with
  if (!isHovered && !isDragging) {
    currentOffset -= AUTO_SCROLL_SPEED;

    // Reset position for seamless infinite scroll
    const oneSetWidth = track.scrollWidth / 5;
    if (currentOffset <= -oneSetWidth * 3) {
      currentOffset = -oneSetWidth * 2;
    }
  }

  // Handle momentum after dragging stops
  if (!isDragging) {
    if (Math.abs(momentum) > MOMENTUM_THRESHOLD) {
      // Apply momentum and decay over time
      currentOffset += momentum;
      momentum *= MOMENTUM_DECAY;

      // Mark as recently dragged for high momentum to prevent clicks
      if (Math.abs(momentum) > HIGH_MOMENTUM_THRESHOLD) {
        recentlyDragged = true;
      }
      
      // Keep carousel within bounds during momentum
      const oneSetWidth = track.scrollWidth / 5;
      const viewportWidth = window.innerWidth;
      // Dynamic buffer based on viewport width
      const dynamicBuffer = Math.min(viewportWidth * 0.5, oneSetWidth * 0.3);
      if (currentOffset > -dynamicBuffer) {
        currentOffset -= oneSetWidth;
      }
      if (currentOffset < -(oneSetWidth * 3 + dynamicBuffer)) {
        currentOffset += oneSetWidth;
      }
    } else {
      // Stop momentum once low enough
      momentum = 0;
      if (recentlyDragged) {
        setTimeout(() => recentlyDragged = false, 50);
      }
    }
  }

  // Update the visual position
  track.style.transform = `translateX(${currentOffset}px)`;

  animationId = requestAnimationFrame(animate);
}

function startAnimation() {
  if (animationId) cancelAnimationFrame(animationId);
  animate();
}

// --- Carousel event handlers ---
carousel.addEventListener('mouseenter', () => {
  if (!isDragging) isHovered = true;
});

carousel.addEventListener('mouseleave', () => {
  if (!isDragging) isHovered = false;
});

carousel.addEventListener('wheel', (e) => {
  if (!isHovered) return;
  e.preventDefault();

  recentlyDragged = true;
  setTimeout(() => recentlyDragged = false, 150);

  currentOffset -= e.deltaY * 0.5;
  track.style.transform = `translateX(${currentOffset}px)`;

  const oneSetWidth = track.scrollWidth / 5;
  const viewportWidth = window.innerWidth;
  // Dynamic buffer based on viewport width
  const dynamicBuffer = Math.min(viewportWidth * 0.5, oneSetWidth * 0.3);
  if (currentOffset > -dynamicBuffer) {
    currentOffset -= oneSetWidth;
  }
  if (currentOffset < -(oneSetWidth * 3 + dynamicBuffer)) {
    currentOffset += oneSetWidth;
  }
});

// --- Touch and drag handlers ---
function handleTouchStart(e) {
  isDragging = true;
  hasMoved = false;
  momentum = 0;
  velocity = 0;
  isMouseInteraction = !e.touches;

  const touch = e.touches ? e.touches[0] : e;
  startX = lastX = touch.clientX;
  startTime = lastTime = Date.now();
}

function handleTouchMove(e) {
  if (!isDragging) return;

  const touch = e.touches ? e.touches[0] : e;
  const currentX = touch.clientX;
  const currentTime = Date.now();
  const deltaX = currentX - lastX;
  const totalMovement = Math.abs(currentX - startX);
  const threshold = isMouseInteraction ? MOUSE_DRAG_THRESHOLD : TOUCH_DRAG_THRESHOLD;

  if (!hasMoved && totalMovement > threshold) {
    hasMoved = true;
    e.preventDefault();
  }

  if (hasMoved && totalMovement > threshold) {
    const deltaTime = currentTime - lastTime;
    currentOffset += deltaX;
    track.style.transform = `translateX(${currentOffset}px)`;

    if (deltaTime > 0) velocity = deltaX / deltaTime;

    const oneSetWidth = track.scrollWidth / 5;
    const viewportWidth = window.innerWidth;
    // Dynamic buffer based on viewport width
    const dynamicBuffer = Math.min(viewportWidth * 0.5, oneSetWidth * 0.3);
    if (currentOffset > -dynamicBuffer) {
      currentOffset -= oneSetWidth;
    }
    if (currentOffset < -(oneSetWidth * 3 + dynamicBuffer)) {
      currentOffset += oneSetWidth;
    }

    e.preventDefault();
  }

  lastX = currentX;
  lastTime = currentTime;
}

function handleTouchEnd(e) {
  if (!isDragging) return;

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const totalMovement = Math.abs(lastX - startX);
  const threshold = isMouseInteraction ? MOUSE_DRAG_THRESHOLD : TOUCH_DRAG_THRESHOLD;

  isDragging = false;

  const isTap = totalMovement < threshold && totalTime < TAP_TIME_THRESHOLD;
  const isQuickTap = totalTime < 200 && totalMovement < threshold;

  if (isTap || isQuickTap) {
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const clickedElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const slideItem = clickedElement?.closest('.slide[data-key]');

    if (slideItem) {
      velocity = momentum = 0;
      handleItemActivate(slideItem);
    }
  } else if (hasMoved && totalMovement > threshold) {
    recentlyDragged = true;
    setTimeout(() => recentlyDragged = false, isMouseInteraction ? 200 : 300);

    momentum = Math.max(-200, Math.min(200, velocity * 15));
  }

  hasMoved = false;
}

// --- Event listeners ---
carousel.addEventListener('touchstart', handleTouchStart, { passive: false });
carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
carousel.addEventListener('touchend', handleTouchEnd, { passive: false });

carousel.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  mouseDragStarted = false;
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
  if (!isMouseDown) return;

  const totalMovement = Math.max(
    Math.abs(e.clientX - mouseStartX),
    Math.abs(e.clientY - mouseStartY)
  );

  if (!mouseDragStarted && totalMovement > MOUSE_DRAG_THRESHOLD) {
    mouseDragStarted = true;
    handleTouchStart(e);
  }

  if (mouseDragStarted && isDragging) {
    handleTouchMove(e);
  }
});

document.addEventListener('mouseup', (e) => {
  if (mouseDragStarted && isDragging) {
    handleTouchEnd(e);
  }
  isMouseDown = false;
  mouseDragStarted = false;
});

// --- Initialization ---
window.addEventListener('load', () => {
  initCarousel();
  initProjectLinks();
});
