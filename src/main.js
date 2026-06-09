/* ============================================================
   Srikanth & Keerthi Wedding — Main JavaScript
   ============================================================ */

import './style.css';

// ── DOM References ──
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const preloader       = $('#preloader');
const landing         = $('#landing');
const openBtn         = $('#open-invitation-btn');
const mainContent     = $('#main-content');
const petalsContainer = $('#petals-container');
const musicBtn        = $('#music-btn');
const bgMusic         = $('#bg-music');
const rsvpForm        = $('#rsvp-form');
const rsvpSuccess     = $('#rsvp-success');

// ── Wedding Date (June 29, 2026) ──
const WEDDING_DATE = new Date('2026-06-29T09:00:00-04:00');

// ============================================================
// 1. PRELOADER
// ============================================================
function initPreloader() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800);
    }, 2200); // Wait for progress bar animation
  });
}

// ============================================================
// 2. CURTAIN REVEAL
// ============================================================
function initCurtainReveal() {
  openBtn.addEventListener('click', () => {
    // Add curtain opening class
    landing.classList.add('curtains-open');

    // Auto-play music when invitation opens
    if (bgMusic.paused) {
      musicBtn.click();
    }

    // After curtain animation, show main content
    setTimeout(() => {
      landing.classList.add('gone');
      mainContent.classList.remove('hidden');
      document.body.style.overflow = '';

      // Start petals after reveal
      startPetals();

      // Trigger scroll animations for visible elements
      setTimeout(() => observeScrollElements(), 200);
    }, 1800);
  });

  // Prevent scroll while landing is visible
  document.body.style.overflow = 'hidden';
}

// ============================================================
// 3. FLOATING PETALS
// ============================================================
let petalInterval = null;

function createPetal() {
  const petal = document.createElement('div');
  const isGold = Math.random() > 0.7;

  petal.classList.add('petal');
  petal.classList.add(isGold ? 'gold' : 'pink');

  // Random properties
  const size = isGold ? (4 + Math.random() * 6) : (8 + Math.random() * 10);
  const startX = Math.random() * 100;
  const duration = 6 + Math.random() * 8;
  const delay = Math.random() * 2;
  const swayAmount = 20 + Math.random() * 40;
  const rotateStart = Math.random() * 360;

  petal.style.cssText = `
    left: ${startX}vw;
    width: ${size}px;
    height: ${size * 1.3}px;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
    --sway: ${swayAmount}px;
    transform: rotate(${rotateStart}deg);
    opacity: 0;
  `;

  petalsContainer.appendChild(petal);

  // Remove petal after animation
  setTimeout(() => {
    if (petal.parentNode) {
      petal.remove();
    }
  }, (duration + delay) * 1000);
}

function startPetals() {
  // Create initial burst
  for (let i = 0; i < 8; i++) {
    setTimeout(() => createPetal(), i * 200);
  }

  // Keep creating petals
  petalInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      createPetal();
    }
  }, 1200);
}

// Pause petals when tab is not visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && petalInterval) {
    clearInterval(petalInterval);
    petalInterval = null;
  } else if (document.visibilityState === 'visible' && !petalInterval && mainContent && !mainContent.classList.contains('hidden')) {
    petalInterval = setInterval(() => createPetal(), 1200);
  }
});

// ============================================================
// 4. COUNTDOWN TIMER
// ============================================================
function initCountdown() {
  const daysEl = $('#cd-days');
  const hoursEl = $('#cd-hours');
  const minutesEl = $('#cd-minutes');
  const secondsEl = $('#cd-seconds');

  function update() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// ============================================================
// 5. SCROLL REVEAL ANIMATIONS
// ============================================================
function observeScrollElements() {
  const revealElements = $$('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

// ============================================================
// 6. RSVP FORM
// ============================================================
function initRSVP() {
  if (!rsvpForm) return;

  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = $('#rsvp-submit');
    const btnLabel = submitBtn.querySelector('.btn-label');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Collect form data
    const formData = {
      name: $('#f-name') ? $('#f-name').value.trim() : '',
      attend: $('#f-attend') ? $('#f-attend').value : '',
      events: $('#f-events') ? $('#f-events').value : '',
      guests: $('#f-guests') ? $('#f-guests').value : '0',
      contact: $('#f-contact') ? $('#f-contact').value.trim() : '',
      wishes: $('#f-wishes') ? $('#f-wishes').value.trim() : '',
      timestamp: new Date().toISOString(),
    };

    // Validate
    if (!formData.name) {
      shakeElement(submitBtn);
      return;
    }

    // Show loading
    submitBtn.disabled = true;
    btnLabel.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    try {
      const isAttending = formData.attend === 'yes';
      const guestCount = isAttending ? parseInt(formData.guests, 10) || 0 : 0;

      // 1. Fetch current cumulative guest count from immanuel.co KV store
      let currentTotal = 0;
      try {
        const getValResponse = await fetch("https://keyvalue.immanuel.co/api/KeyVal/GetValue/s05xpdx9/total_guests");
        if (getValResponse.ok) {
          let textVal = await getValResponse.text();
          // Remove potential leading/trailing double quotes
          textVal = textVal.replace(/^"|"$/g, '');
          currentTotal = parseInt(textVal, 10) || 0;
        }
      } catch (err) {
        console.error('Failed to retrieve cumulative guest count:', err);
      }

      const newTotal = currentTotal + guestCount;

      // 2. Save updated cumulative count back to KV store
      if (guestCount > 0) {
        try {
          await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/s05xpdx9/total_guests/${newTotal}`, {
            method: "POST",
            headers: {
              "Content-Length": "0"
            },
            body: ""
          });
        } catch (err) {
          console.error('Failed to update cumulative guest count:', err);
        }
      }

      // Send data using FormSubmit.co
      const formBody = new FormData();
      formBody.append('Name', formData.name);
      formBody.append('Will Attend', isAttending ? 'Yes' : formData.attend === 'no' ? 'No' : 'Not specified');
      formBody.append('Attending Events', formData.events || 'Not specified');
      formBody.append('Number of Guests in this RSVP', guestCount);
      formBody.append('Total Guests Attending (Cumulative)', newTotal);
      formBody.append('Contact Info', formData.contact || 'Not provided');
      formBody.append('Wishes for Couple', formData.wishes || 'No wishes');
      formBody.append('_subject', 'RSVP from ' + formData.name + ' - Neha & Dhaval Wedding');
      formBody.append('_captcha', 'false');

      const response = await fetch("https://formsubmit.co/dhavalnehaaa@gmail.com", {
        method: "POST",
        body: formBody
      });

      if (!response.ok) {
        throw new Error("Email service returned status " + response.status);
      }

      // Show success
      rsvpForm.classList.add('hidden');
      rsvpSuccess.classList.remove('hidden');

      // Celebration burst
      for (let i = 0; i < 15; i++) {
        setTimeout(() => createPetal(), i * 100);
      }
    } catch (err) {
      console.error('RSVP submission error:', err);
      alert('Something went wrong. Please try again. Error: ' + err.message);
      submitBtn.disabled = false;
      btnLabel.classList.remove('hidden');
      btnLoader.classList.add('hidden');
    }
  });
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight; // Trigger reflow
  el.style.animation = 'shake 0.5s ease';
  setTimeout(() => { el.style.animation = ''; }, 500);
}

// Add shake keyframe dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

// ============================================================
// 7. MUSIC TOGGLE
// ============================================================
function initMusic() {
  let isPlaying = false;

  musicBtn.addEventListener('click', () => {
    if (!bgMusic.src && !bgMusic.querySelector('source')) {
      // No music file added yet
      musicBtn.style.animation = 'shake 0.5s ease';
      setTimeout(() => { musicBtn.style.animation = ''; }, 500);
      return;
    }

    if (isPlaying) {
      bgMusic.pause();
      musicBtn.classList.remove('playing');
      musicBtn.querySelector('.music-icon').textContent = '🎵';
    } else {
      bgMusic.play().catch(() => {});
      musicBtn.classList.add('playing');
      musicBtn.querySelector('.music-icon').textContent = '🎶';
    }
    isPlaying = !isPlaying;
  });
}

// ============================================================
// 8. IMAGE ERROR HANDLING
// ============================================================
function initImageHandlers() {
  // Handle broken images gracefully
  const storyPhotos = $$('.story-photo');
  storyPhotos.forEach((img) => {
    img.addEventListener('error', () => {
      img.classList.add('img-error');
    });
    // If already errored before JS loaded
    if (img.complete && img.naturalWidth === 0) {
      img.classList.add('img-error');
    }
  });

  // Logo fallback
  const logos = $$('.wedding-logo, .footer-logo, .landing-logo');
  logos.forEach((logo) => {
    logo.addEventListener('error', () => {
      logo.classList.add('img-error');
    });
    if (logo.complete && logo.naturalWidth === 0) {
      logo.classList.add('img-error');
    }
  });
}

// ============================================================
// 9. SPARKLE EFFECTS ON GOLD ELEMENTS
// ============================================================
function initSparkles() {
  // Add subtle sparkle to gold elements on hover (desktop only)
  if (window.matchMedia('(hover: hover)').matches) {
    const goldElements = $$('.gold-bar, .ornament-divider .diamond');
    goldElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        el.style.textShadow = '0 0 10px rgba(201, 168, 76, 0.8)';
        setTimeout(() => { el.style.textShadow = ''; }, 600);
      });
    });
  }
}

// ============================================================
// 10. SMOOTH SCROLL FOR NAVIGATION
// ============================================================
function initSmoothScroll() {
  // If any anchor links are added later, handle them
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}

// ============================================================
// INITIALIZE
// ============================================================
function init() {
  initPreloader();
  initCurtainReveal();
  initCountdown();
  initRSVP();
  initMusic();
  initImageHandlers();
  initSparkles();
  initSmoothScroll();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
