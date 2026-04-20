/**
 * Neuro-sama - Interactive Features
 * Handles user interactions and dynamic behavior
 */

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SUBSCRIPTION HANDLER
// ═══════════════════════════════════════════════════════════════════════════

const signupBtn = document.getElementById('signup-btn');

/**
 * Validates email format using a simple regex pattern
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

if (signupBtn) {
  signupBtn.addEventListener('click', handleEmailSignup);
}

/**
 * Handles email subscription signup
 * Replace with your actual mailing list integration (Mailchimp, etc.)
 */
function handleEmailSignup() {
  const email = prompt('Enter your email to subscribe:');

  // User cancelled the prompt
  if (email === null) {
    return;
  }

  // Validate email format
  if (!email.trim()) {
    alert('Please enter an email address.');
    return;
  }

  if (!isValidEmail(email)) {
    alert('That doesn\'t look like a valid email. Please try again.');
    return;
  }

  // Success message
  alert('Thanks! We\'ll be in touch. \u2661');

  // TODO: POST to your mailing list endpoint
  // Example:
  // fetch('/api/subscribe', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email: email.trim() })
  // })
  // .catch(err => console.error('Subscription error:', err));
}

// ═══════════════════════════════════════════════════════════════════════════
// MARQUEE TEXT CAROUSEL PAUSE ON HOVER
// ═══════════════════════════════════════════════════════════════════════════

const marqueeTrack = document.querySelector('.marquee-track');
const marqueeWrap = document.querySelector('.marquee-wrap');

if (marqueeWrap && marqueeTrack) {
  marqueeWrap.addEventListener('mouseenter', pauseMarquee);
  marqueeWrap.addEventListener('mouseleave', resumeMarquee);
}

/**
 * Pauses the marquee animation when user hovers over it
 */
function pauseMarquee() {
  if (marqueeTrack) {
    marqueeTrack.style.animationPlayState = 'paused';
  }
}

/**
 * Resumes the marquee animation when user moves mouse away
 */
function resumeMarquee() {
  if (marqueeTrack) {
    marqueeTrack.style.animationPlayState = 'running';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE FALLBACK DISPLAY ON LOAD ERROR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handles image loading errors by showing fallback text
 * Selects all images that may have fallback divs
 */
function setupImageFallbacks() {
  const imageSelectors = [
    '.about-img',
    '.shop-img'
  ];

  imageSelectors.forEach(selector => {
    const images = document.querySelectorAll(selector);
    images.forEach(img => {
      img.addEventListener('error', handleImageError);
      // Add loading attribute for better UX
      img.setAttribute('loading', 'lazy');
    });
  });
}

/**
 * Handles image load errors by hiding the image and showing fallback
 * @param {Event} event - The error event from the image
 */
function handleImageError(event) {
  const img = event.target;
  img.style.display = 'none';

  const fallback = img.nextElementSibling;
  if (fallback && fallback.classList.contains('img-fallback')) {
    fallback.style.display = 'flex';
  }
}

// Initialize image fallbacks when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupImageFallbacks);
} else {
  setupImageFallbacks();
}
