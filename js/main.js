/* ==========================================================================
   KINETIC DUO STUDIO — MAIN JAVASCRIPT
   GSAP Animations, ScrollTrigger, Lenis Smooth Scroll, Project Estimator & UI
   ========================================================================== */

let lenisInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLenisSmoothScroll();
  initNavigation();
  initProjectEstimator();
  initFormHandler();
  initTabSwitchers();
  initSmoothScroll();
  initFaqAccordion();
  initScrollAnimations();
});

/* 0. Light / Dark Theme Mode Handler */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('kinetic_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('kinetic_theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = theme === 'dark' ? '🌙' : '☀️';
    toggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }
}

/* 1. Lenis Butter-Smooth Scroll Engine */
function initLenisSmoothScroll() {
  if (typeof Lenis !== 'undefined') {
    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      smoothTouch: false, // Maintain natural, responsive touch gestures on mobile devices
      touchMultiplier: 1.2
    });

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
      lenisInstance.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }
}

/* 2. Navigation Header & Mobile Menu */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      mobileToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      mobileToggle.textContent = isExpanded ? '✕' : '☰';
    });

    // Close menu when clicking link inside menu
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.textContent = '☰';
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (header && !header.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileToggle.textContent = '☰';
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* 3. Interactive Project Scope & Pricing Estimator */
function initProjectEstimator() {
  const scopeBtns = document.querySelectorAll('[data-group="scope"]');
  const designBtns = document.querySelectorAll('[data-group="design"]');
  const devBtns = document.querySelectorAll('[data-group="dev"]');

  const priceDisplay = document.getElementById('estimated-price');
  const timelineDisplay = document.getElementById('estimated-timeline');
  const summaryScopeText = document.getElementById('summary-scope');

  if (!priceDisplay) return;

  let currentScope = 'full-build';
  let currentDesignTier = 'custom-figma';
  let currentDevTier = 'liquid-plus';

  function calculateEstimate() {
    let basePrice = 4500;
    let timelineWeeks = '3-4 Weeks';
    let scopeLabel = 'Full Store Design & Shopify Build';

    if (currentScope === 'redesign') {
      basePrice = 3200;
      timelineWeeks = '2-3 Weeks';
      scopeLabel = 'CRO UI/UX Redesign & Optimization';
    } else if (currentScope === 'audit-speed') {
      basePrice = 1800;
      timelineWeeks = '1-2 Weeks';
      scopeLabel = 'UX Audit & Core Web Vitals Optimization';
    }

    if (currentDesignTier === 'theme-customization') {
      basePrice -= 600;
    }

    if (currentDevTier === 'headless-api') {
      basePrice += 1500;
      timelineWeeks = '4-6 Weeks';
    }

    // Animate price counter if GSAP is available
    if (typeof gsap !== 'undefined') {
      const currentPriceNum = parseInt(priceDisplay.innerText.replace(/[^0-9]/g, '') || '0', 10);
      const targetObj = { val: currentPriceNum || basePrice };
      gsap.to(targetObj, {
        val: basePrice,
        duration: 0.4,
        ease: 'power2.out',
        onUpdate: () => {
          priceDisplay.innerText = `$${Math.floor(targetObj.val).toLocaleString()}`;
        }
      });
    } else {
      priceDisplay.innerText = `$${basePrice.toLocaleString()}`;
    }

    if (timelineDisplay) timelineDisplay.innerText = timelineWeeks;
    if (summaryScopeText) summaryScopeText.innerText = scopeLabel;
  }

  function setupButtonGroup(buttons, updateCallback) {
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        buttons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        updateCallback(btn.dataset.val);
        calculateEstimate();
      });
    });
  }

  setupButtonGroup(scopeBtns, (val) => currentScope = val);
  setupButtonGroup(designBtns, (val) => currentDesignTier = val);
  setupButtonGroup(devBtns, (val) => currentDevTier = val);

  calculateEstimate();
}

/* 4. Google Apps Script Form Submission Integration */
const GOOGLE_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbz_9lQoUaVfV21q0U4oD5r2u5E_placeholder/exec';

function initFormHandler() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'Submit Request';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending Details... ⏳';
      }

      const formData = new FormData(form);
      const payload = {
        timestamp: new Date().toISOString(),
        page_source: window.location.pathname.split('/').pop() || 'index.html',
        referrer: document.referrer || 'direct',
        form_id: form.id || 'contact-form'
      };

      formData.forEach((value, key) => {
        payload[key] = value;
      });

      try {
        await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        // Show success state
        form.style.display = 'none';
        const parent = form.parentElement;
        const successState = parent
          ? parent.querySelector('.form-success-state, #studio-form-success, #contact-success, #developer-form-success, #uiux-form-success')
          : document.querySelector('.form-success-state, #studio-form-success, #contact-success');

        if (successState) {
          successState.style.display = 'block';
          if (lenisInstance) {
            lenisInstance.scrollTo(successState, { offset: -80, duration: 0.8 });
          } else {
            successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } catch (err) {
        console.warn('First attempt returned note, retrying with fallback...', err);

        try {
          await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
          });

          form.style.display = 'none';
          const parent = form.parentElement;
          const successState = parent
            ? parent.querySelector('.form-success-state, #studio-form-success, #contact-success, #developer-form-success, #uiux-form-success')
            : document.querySelector('.form-success-state, #studio-form-success, #contact-success');

          if (successState) {
            successState.style.display = 'block';
            if (lenisInstance) {
              lenisInstance.scrollTo(successState, { offset: -80, duration: 0.8 });
            } else {
              successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        } catch (fallbackErr) {
          console.error('Lead submission completely failed:', fallbackErr);

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
          }
        }
      }
    });
  });
}

/* 5. Tab Switchers for Developer Code Snippets & Portfolio Views */
function initTabSwitchers() {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      const parentContainer = btn.closest('.tabs-wrapper');

      if (parentContainer) {
        parentContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        parentContainer.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = parentContainer.querySelector(`#${targetId}`);
        if (targetPane) targetPane.classList.add('active');
      }
    });
  });
}

/* 6. Smooth Scroll for Anchor Links (Lenis Integrated) */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          if (lenisInstance) {
            lenisInstance.scrollTo(targetElement, { offset: -60, duration: 1.1 });
          } else {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      }
    });
  });
}

/* 7. Interactive FAQ Accordion with Smooth +/- Animation */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item, index) => {
    // Open first FAQ item by default
    if (index === 0) {
      item.classList.add('active');
    }

    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isCurrentlyActive = item.classList.contains('active');

      // Close all other items for clean single-accordion experience
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current item
      if (isCurrentlyActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }

      // Refresh ScrollTrigger after accordion height change
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(() => ScrollTrigger.refresh(), 360);
      }
    });
  });
}

/* 8. Bulletproof Scroll Reveal & GSAP Animations (No Blank Sections) */
function initScrollAnimations() {
  // 1. Reveal All Cards & Content Elements on Scroll
  const revealTargets = document.querySelectorAll(
    '.service-card, .performance-card, .workflow-step-card, .duo-card, .toolkit-card, .portfolio-card, .journey-step-card, .comparison-card, .faq-item, .testimonial-card, .editorial-quote-box, .code-mockup-window, .section-header, .estimator-box, .contact-form-card, .contact-info-side, .case-study-content, .case-study-media, .partner-table-cell, .brand-showcase-card, .value-box-card, .stat-summary-item, .venn-svg-wrapper'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -20px 0px',
      threshold: 0.02
    });

    revealTargets.forEach(el => {
      el.classList.add('reveal-init');

      // Stagger siblings in grid containers
      const parent = el.parentElement;
      if (parent) {
        const index = Array.from(parent.children).indexOf(el);
        if (index >= 0 && index <= 5) {
          el.classList.add(`reveal-delay-${index}`);
        }
      }

      observer.observe(el);
    });

    // Safety fallback: reveal any element in viewport immediately
    setTimeout(() => {
      revealTargets.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('revealed');
        }
      });
    }, 200);
  } else {
    // Legacy fallback: show all immediately
    revealTargets.forEach(el => el.classList.add('revealed'));
  }

  // 2. Hero Section Entrance Animation with GSAP
  if (typeof gsap !== 'undefined') {
    const heroTitle = document.querySelector('.hero-title');
    const heroMedia = document.querySelector('.hero-media-showcase');

    if (heroTitle) {
      gsap.fromTo('.hero-tag-row',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
      );
      gsap.fromTo('.hero-title',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.08, ease: 'power2.out', clearProps: 'all' }
      );
      gsap.fromTo('.hero-text-content .lead, .hero-text-content p',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.16, ease: 'power2.out', clearProps: 'all' }
      );
      gsap.fromTo('.hero-cta-group',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.22, ease: 'power2.out', clearProps: 'all' }
      );
      gsap.fromTo('.hero-stats-grid',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: 'power2.out', clearProps: 'all' }
      );
    }

    if (heroMedia) {
      gsap.fromTo('.hero-media-showcase',
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.7, delay: 0.15, ease: 'power2.out', clearProps: 'all' }
      );
    }

    // Floating cards ambient breathing
    document.querySelectorAll('.hero-floating-card').forEach(card => {
      gsap.to(card, {
        y: -6,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // 3. Numbers & Metrics Live Counting Animation
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const metricElements = document.querySelectorAll('.stat-number, .metric-item h4');
      metricElements.forEach(el => {
        const originalText = el.innerText.trim();
        const numMatch = originalText.match(/\d+/);
        if (numMatch) {
          const targetNum = parseInt(numMatch[0], 10);
          const prefix = originalText.split(numMatch[0])[0] || '';
          const suffix = originalText.split(numMatch[0])[1] || '';

          ScrollTrigger.create({
            trigger: el,
            start: 'top 92%',
            once: true,
            onEnter: () => {
              const counterObj = { val: 0 };
              gsap.to(counterObj, {
                val: targetNum,
                duration: 1.2,
                ease: 'power2.out',
                onUpdate: () => {
                  el.innerText = prefix + Math.floor(counterObj.val) + suffix;
                }
              });
            }
          });
        }
      });

      window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
      });
    }
  }
}
