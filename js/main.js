/* ==========================================================================
   KINETIC DUO STUDIO — MAIN JAVASCRIPT
   Interactivity, Project Estimator Calculator, Mobile Nav & Animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavigation();
  initProjectEstimator();
  initFormHandler();
  initTabSwitchers();
  initSmoothScroll();
});

/* 0. Light / Dark Theme Mode Handler */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('kinetic_theme', nextTheme);
    });
  }
}

/* 1. Navigation Header & Mobile Menu */
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

/* 2. Interactive Project Scope & Pricing Estimator */
function initProjectEstimator() {
  const scopeBtns = document.querySelectorAll('[data-group="scope"]');
  const designBtns = document.querySelectorAll('[data-group="design"]');
  const devBtns = document.querySelectorAll('[data-group="dev"]');

  const priceDisplay = document.getElementById('estimated-price');
  const timelineDisplay = document.getElementById('estimated-timeline');
  const summaryScopeText = document.getElementById('summary-scope');

  if (!priceDisplay) return;

  let currentScope = 'full-build'; // default: 'full-build', 'redesign', 'audit-speed'
  let currentDesignTier = 'custom-figma'; // 'custom-figma', 'theme-customization'
  let currentDevTier = 'liquid-plus'; // 'liquid-plus', 'headless-api'

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
      scopeLabel = 'UX Teardown & 95+ Lighthouse Speed Overhaul';
    }

    if (currentDesignTier === 'custom-figma') {
      basePrice += 1500;
    }

    if (currentDevTier === 'headless-api') {
      basePrice += 2500;
      timelineWeeks = '4-6 Weeks';
      scopeLabel += ' (Headless Storefront API)';
    }

    // Format output
    priceDisplay.textContent = `$${basePrice.toLocaleString()}`;
    if (timelineDisplay) timelineDisplay.textContent = timelineWeeks;
    if (summaryScopeText) summaryScopeText.textContent = scopeLabel;
  }

  // Bind click listeners for option buttons
  function setupButtonGroup(buttons, callback) {
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        callback(btn.dataset.value);
        calculateEstimate();
      });
    });
  }

  setupButtonGroup(scopeBtns, (val) => { currentScope = val; });
  setupButtonGroup(designBtns, (val) => { currentDesignTier = val; });
  setupButtonGroup(devBtns, (val) => { currentDevTier = val; });

  // Initial calculation
  calculateEstimate();
}

/* 3. Contact Form Handler with Instant Feedback */
function initFormHandler() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
          </svg>
          Sending...
        `;
        submitBtn.disabled = true;
      }

      const parent = form.parentElement;
      const successState = parent ? parent.querySelector('#form-success-message') : document.getElementById('form-success-message');

      setTimeout(() => {
        form.style.display = 'none';
        if (successState) {
          successState.style.display = 'block';
          successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000);
    });
  });
}

/* 4. Tab Switchers for Developer Code Snippets & Portfolio Views */
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

/* 5. Smooth Scroll for Anchor Links */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });
}
