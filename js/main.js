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
  initPortfolioFilters();
  initCaseStudyModal();
  initBlogFeatures();
});

/* 0. Light / Dark Theme Mode Handler */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('kinetic_theme_mode') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('kinetic_theme_mode', nextTheme);
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

    // Mobile menu dropdown toggle handlers
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
          e.preventDefault();
          const parentDropdown = toggle.closest('.nav-dropdown');
          if (parentDropdown) {
            const isOpen = parentDropdown.classList.contains('open');
            document.querySelectorAll('.nav-dropdown.open').forEach(d => {
              if (d !== parentDropdown) d.classList.remove('open');
            });
            parentDropdown.classList.toggle('open', !isOpen);
          }
        }
      });
    });

    // Close menu when clicking link inside menu (excluding dropdown toggles)
    navLinks.querySelectorAll('a:not(.nav-dropdown-toggle)').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.textContent = '☰';
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (header && !header.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileToggle.textContent = '☰';
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
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
const GOOGLE_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbz2PF2Ac9TNqlpZq5SiK2QifUgrozC61oYiuTva2pG4GTqhDNGtyyELK0oiko6rj_E/exec';

function initFormHandler() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Remove any previous error banner
      const existingError = form.querySelector('.form-error-message');
      if (existingError) {
        existingError.remove();
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'Submit Request';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; vertical-align: middle; margin-right: 6px; display: inline-block;">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
          </svg>
          Sending Request...
        `;
      }

      const formType = form.dataset.formType || form.id || 'studio_general';
      let pageSource = window.location.pathname.split('/').pop();
      if (!pageSource || pageSource.trim() === '') {
        pageSource = 'index.html';
      }

      const formData = new FormData(form);
      const payload = {
        form_type: formType,
        page_source: pageSource,
        name: (formData.get('name') || '').toString().trim(),
        email: (formData.get('email') || '').toString().trim(),
        store_url: (formData.get('store_url') || '').toString().trim(),
        service: (formData.get('service') || '').toString().trim(),
        message: (formData.get('message') || '').toString().trim(),
        timestamp: new Date().toISOString()
      };

      // Append any additional form fields if present (e.g., budget, timeline, estimate)
      formData.forEach((value, key) => {
        if (!(key in payload)) {
          payload[key] = value.toString().trim();
        }
      });

      try {
        // Send payload via text/plain to avoid pre-flight CORS blocks with Google Apps Script
        await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
          method: 'POST',
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
          : document.querySelector('.form-success-state, #studio-form-success, #contact-success, #developer-form-success, #uiux-form-success');

        if (successState) {
          successState.style.display = 'block';
          if (lenisInstance) {
            lenisInstance.scrollTo(successState, { offset: -80, duration: 0.8 });
          } else {
            successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } catch (err) {
        console.warn('Standard fetch caught, executing reliable no-cors fallback:', err);

        try {
          // Fallback: Send with mode no-cors for guaranteed delivery to Google Sheets
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
            : document.querySelector('.form-success-state, #studio-form-success, #contact-success, #developer-form-success, #uiux-form-success');

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

          const errorDiv = document.createElement('div');
          errorDiv.className = 'form-error-message';
          errorDiv.style.cssText = 'margin-top: 16px; padding: 14px 18px; background: #7F1D1D; border: 1px solid #EF4444; border-radius: var(--radius-md); color: #FEE2E2; font-size: 0.9rem; text-align: center;';
          errorDiv.textContent = 'Something went wrong while sending your request. Please email us directly at hello@kineticduo.com';
          form.appendChild(errorDiv);
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

          // If inside services pills bar, update active pill
          if (this.classList.contains('service-pill-btn')) {
            document.querySelectorAll('.service-pill-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
          }

          // Calculate offset dynamically based on sticky headers
          const hasStickyPills = !!document.querySelector('.service-pills-bar');
          const scrollOffset = hasStickyPills ? -170 : -90;

          if (lenisInstance) {
            lenisInstance.scrollTo(targetElement, { offset: scrollOffset, duration: 1.0 });
          } else {
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
              top: elementPosition + scrollOffset,
              behavior: 'smooth'
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
    '.service-card, .service-block-item, .performance-card, .workflow-step-card, .why-us-card, .approach-step-card, .duo-card, .toolkit-card, .portfolio-card, .portfolio-card-item, .process-card-step, .audience-card, .pillar-card, .cta-banner-card, .journey-step-card, .comparison-card, .faq-item, .testimonial-card, .editorial-quote-box, .code-mockup-window, .section-header, .estimator-box, .contact-form-card, .contact-info-side, .case-study-content, .case-study-media, .partner-table-cell, .brand-showcase-card, .value-box-card, .stat-summary-item, .venn-svg-wrapper'
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

/* 9. Portfolio Filter Tabs Handler */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const projectCards = document.querySelectorAll('.work-project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter') || 'all';

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'all 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.style.display = 'none';
        }
      });

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  });
}

/* 10. 6-Part Case Study Modal / Viewer Handler */
function initCaseStudyModal() {
  const openButtons = document.querySelectorAll('[data-case-study]');
  const modalOverlay = document.getElementById('case-study-modal');
  const closeBtn = document.getElementById('case-modal-close');

  if (!modalOverlay) return;

  // Case Studies Data Dictionary with exact 6-part template
  const caseStudiesData = {
    aura: {
      tag: "ORGANIC SKINCARE D2C",
      title: "AURA Botanical Skincare",
      services: "Shopify Development / UI/UX / Redesign / Optimization",
      desc: "Transforming a modern merchant for a cleaner, high-converting shopping experience.",
      overview: "AURA Botanical needed to transition away from a rigid, bloated theme that suffered from high bounce rates and slow mobile page loads. The brand set out to rebuild on a bespoke Shopify 2.0 architecture that showcases clean ingredients while delivering a sub-second shopping experience.",
      challenge: "The primary challenge was balancing rich editorial storytelling, interactive ingredient popups, and high-res imagery with aggressive Core Web Vitals targets, especially on 4G mobile devices where 78% of their customer traffic originated.",
      approach: "We initiated the project with deep customer journey mapping in Figma, crafting clean product page wireframes with sticky ATC bars and slide-out cart upsells. Concurrently, we engineered modular Liquid sections with custom metafields for ingredients.",
      work: "Delivered a complete bespoke Shopify 2.0 theme, dynamic bundle builder section, custom cart drawer with free-shipping progression thresholds, and zero third-party script bloat.",
      result: "Achieved a +42% increase in mobile conversion rate, sub-0.9s average page load time, +28% Average Order Value (AOV) via cart upsells, and eliminated $650/month in third-party app subscriptions.",
      takeaway: "Direct collaboration between designer and developer from day one ensured that visual elegance was preserved without sacrificing raw performance."
    },
    atelier: {
      tag: "LUXURY APPAREL",
      title: "ATELIER ÉLEVÉ",
      services: "Shopify Development / UI/UX / Redesign",
      desc: "A custom Shopify 2.0 storefront built for flexibility, editorial prestige, and seamless checkout.",
      overview: "ATELIER ÉLEVÉ required an elevated, boutique shopping destination that reflected Parisian luxury fashion while providing their marketing team with flexible modular sections for seasonal lookbooks.",
      challenge: "High abandonment at the product variant selection stage due to confusing size guide popups and clunky dropdowns on mobile screens.",
      approach: "Re-architected the entire PDP in Figma with dynamic swatch selectors, visual size recommendation modals, and integrated high-fashion editorial carousels powered by native Shopify metafields.",
      work: "Engineered bespoke lookbook 'Shop the Look' hotspot sections, high-speed collection filter drawers, and one-click Apple Pay / Shop Pay checkout acceleration.",
      result: "99/100 Mobile Speed score, +34% checkout completion rate, 2.4x increase in lookbook upsell conversions, and 100% theme customization capability for non-technical team members.",
      takeaway: "Tailoring every micro-interaction to the luxury mindset increased buyer confidence and reduced checkout friction significantly."
    },
    lumina: {
      tag: "D2C HOME & LIVING",
      title: "LUMINA Goods",
      services: "Shopify Development / Speed & Performance / Optimization",
      desc: "Modernizing a timeless store layout, flow, and sub-second Ajax search.",
      overview: "LUMINA Goods was experiencing sluggish load times and dropping conversion rates across their multi-category home living storefront due to years of accumulated app scripts and unoptimized assets.",
      challenge: "Page load times exceeded 4.8 seconds on mobile, failing Google Core Web Vitals and hurting organic search rankings and ad conversion efficiency.",
      approach: "Conducted a ruthless technical audit, removing redundant app scripts, converting DOM heavy widgets into native Liquid snippets, and restructuring media delivery with next-gen responsive image tags.",
      work: "Rebuilt the global navigation, implemented sub-second Ajax live search with product thumbnails, and engineered native collection filtering.",
      result: "Lighthouse performance score jumped from 38 to 98/100. Revenue per visitor increased by +28%, and recurring app fees were slashed by 64%.",
      takeaway: "Performance is UX. Speed optimizations directly unlocked higher ROI across all paid marketing channels."
    },
    vortex: {
      tag: "PERFORMANCE APPAREL",
      title: "VORTEX Activewear",
      services: "Shopify Development / CRO & Experience Optimization",
      desc: "High-velocity activewear storefront with cart drawer upsells and frictionless mobile UX.",
      overview: "VORTEX wanted to scale their high-traffic drops with an ultra-responsive storefront that could handle peak traffic surges without checkout slowdowns.",
      challenge: "Traffic was high, but shoppers frequently abandoned single-item carts without exploring complementary gear.",
      approach: "Designed and built an intelligent slide-out cart drawer with dynamic tier progress bars (Free Shipping, Free Gift, VIP Discount) and 1-click cross-sell product suggestions.",
      work: "Built custom quick-add size pickers on collection cards, sticky mobile Add to Cart bars, and accelerated checkout triggers.",
      result: "+38% increase in multi-item cart rate, +22% AOV boost during Black Friday, and zero downtime across 50,000 concurrent peak visitors.",
      takeaway: "Smart in-cart merchandising converted casual single-item purchasers into high-value repeat customers."
    },
    noir: {
      tag: "LUXURY HOROLOGY",
      title: "NOIR & BLANC Timepieces",
      services: "UI/UX Design / Custom Liquid Development",
      desc: "Bespoke timepiece product experience with custom strap configurator.",
      overview: "NOIR & BLANC needed an exquisite digital showroom that allowed collectors to visualize custom watch dials and strap combinations in real-time.",
      challenge: "High-ticket horology requires immense customer trust and flawless visual representation of micro-craftsmanship.",
      approach: "Created a tactile, interactive strap configurator in Figma and coded it natively in Liquid and Vanilla JS with zero third-party plugin bloat.",
      work: "Engineered ultra-high-res sapphire crystal macro zoom viewers, dynamic strap switcher, and bespoke engraving preview tool.",
      result: "+55% increase in time-on-page, 3.2x increase in custom strap add-on sales, and a 48% reduction in pre-purchase inquiry tickets.",
      takeaway: "Interactive product customization builds emotional ownership before the customer even reaches the checkout."
    },
    solaris: {
      tag: "WELLNESS & SUPPLEMENTS",
      title: "SOLARIS Nutrition",
      services: "Shopify Development / UI/UX / Analytics & Tracking",
      desc: "Clean wellness eCommerce with seamless subscription recharge and GA4 tracking.",
      overview: "SOLARIS Nutrition required a clean, science-backed storefront with recurring subscription bundles and airtight tracking across all acquisition funnels.",
      challenge: "Subscription options were hidden inside complicated radio buttons, resulting in lost recurring revenue and high customer support volume.",
      approach: "Redesigned the subscription selector box with clear savings callouts ('Subscribe & Save 20%'), flexible frequency toggles, and instant cart updates.",
      work: "Implemented seamless Recharge integration, GA4 server-side tracking, Meta CAPI, and Microsoft Clarity behavioral heatmaps.",
      result: "+68% increase in recurring subscriber acquisition, 99.4% tracking accuracy across marketing channels, and +31% overall store conversion rate.",
      takeaway: "Making recurring value crystal clear at the moment of decision is the single highest-leverage lever in D2C wellness."
    }
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const studyKey = btn.getAttribute('data-case-study');
      const data = caseStudiesData[studyKey];

      if (!data) return;

      document.getElementById('modal-case-tag').innerText = data.tag;
      document.getElementById('modal-case-title').innerText = data.title;
      document.getElementById('modal-case-services').innerText = data.services;
      document.getElementById('modal-case-overview').innerText = data.overview;
      document.getElementById('modal-case-challenge').innerText = data.challenge;
      document.getElementById('modal-case-approach').innerText = data.approach;
      document.getElementById('modal-case-work').innerText = data.work;
      document.getElementById('modal-case-result').innerText = data.result;
      document.getElementById('modal-case-takeaway').innerText = data.takeaway;

      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });
}

/* 11. Blog Filters & Interactive Article Modal */
function initBlogFeatures() {
  const filterButtons = document.querySelectorAll('#blog-articles-container').length > 0
    ? document.querySelectorAll('.portfolio-filters-wrap .filter-tab-btn')
    : [];
  const articleCards = document.querySelectorAll('.blog-article-card');
  const modalOverlay = document.getElementById('article-reader-modal');
  const closeBtn = document.getElementById('article-modal-close-btn');

  // Filter Tabs
  if (filterButtons.length > 0 && articleCards.length > 0) {
    // Check URL search parameters (e.g. ?cat=shopify)
    const urlParams = new URLSearchParams(window.location.search);
    const initialCat = urlParams.get('cat');
    if (initialCat) {
      filterButtons.forEach(b => {
        if (b.getAttribute('data-filter') === initialCat) {
          filterButtons.forEach(btn => btn.classList.remove('active'));
          b.classList.add('active');
          filterArticles(initialCat);
        }
      });
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterVal = btn.getAttribute('data-filter');
        filterArticles(filterVal);
      });
    });

    function filterArticles(filter) {
      articleCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        if (filter === 'all' || cat.includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  }

  // Full Article Data Dictionary
  const blogArticlesData = {
    'article-1': {
      tag: 'UI/UX DESIGN',
      title: '10 Shopify UX Issues That Can Quietly Hurt Conversions',
      meta: '⏱ 6 min read • By Lead UI/UX Designer • Kinetic Duo Studio',
      content: `
        <p>When an eCommerce store underperforms, merchants often jump to blaming their traffic quality, product pricing, or ad creatives. Yet in over 100+ storefront audits, we consistently find subtle UX friction points that quietly drain conversion rates.</p>
        
        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">1. Occluded Mobile Buy Buttons</h3>
        <p>On mobile viewports, cookie banners, floating rewards launchers, and customer support widgets frequently stack on top of sticky 'Add to Cart' buttons, causing rage-clicks and checkout abandonment.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">2. Hidden Variant Availability</h3>
        <p>Disabling unavailable size or color options with faint gray text rather than clear visual strike-throughs or instant restock notification triggers causes shoppers to bounce rather than explore in-stock alternatives.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">3. Lack of Frictionless Cart Drawer Feedback</h3>
        <p>Redirecting buyers to a full /cart page disrupts the shopping flow. A modern, high-converting slide-cart with real-time shipping threshold updates keeps users engaged and buying.</p>
      `
    },
    'article-2': {
      tag: 'STRATEGY & CRO',
      title: 'How to Audit a Shopify Store Before Redesigning It',
      meta: '⏱ 8 min read • By Studio Duo • Kinetic Duo Studio',
      content: `
        <p>A redesign should never be a visual guessing game. Jumping into Figma without quantitative and qualitative data risks breaking the high-converting elements that are already working.</p>
        
        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Step 1: Quantitative Funnel Analysis</h3>
        <p>Map your GA4 drop-off funnel: Homepage → Collection → PDP → Cart View → Checkout Started → Purchase. Identify where the largest drop-off occurs.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Step 2: Qualitative Heatmaps & Recordings</h3>
        <p>Watch 50+ session recordings in Microsoft Clarity. Look for rage-clicks, rapid scrolling past non-essential sections, and where mobile users get stuck.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Step 3: Code & App Pruning</h3>
        <p>List all third-party apps installed. Uninstall unused tracking pixels and bloated apps that inject synchronous JavaScript into your theme head.</p>
      `
    },
    'article-3': {
      tag: 'SPEED & PERFORMANCE',
      title: 'Shopify Speed: What Actually Matters for Store Owners?',
      meta: '⏱ 5 min read • By Lead Shopify Developer • Kinetic Duo Studio',
      content: `
        <p>Many store owners obsess over theoretical scores from third-party tools that do not reflect real buyer experience. What actually impacts revenue are Google's Core Web Vitals measured on real field devices.</p>
        
        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Largest Contentful Paint (LCP)</h3>
        <p>How quickly the main product hero image or headline loads on a 4G mobile connection. Target: Under 1.8 seconds.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Interaction to Next Paint (INP)</h3>
        <p>How responsive the page feels when a user taps a variant swatch, opens the cart drawer, or clicks an accordion. Target: Under 200ms.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Cumulative Layout Shift (CLS)</h3>
        <p>Preventing content from jumping while images and banner fonts load. Target: Under 0.1.</p>
      `
    },
    'article-4': {
      tag: 'UI/UX DESIGN',
      title: 'Product Page UX: The Elements Shoppers Need Before Buying',
      meta: '⏱ 7 min read • By Lead UI/UX Designer • Kinetic Duo Studio',
      content: `
        <p>The Product Detail Page (PDP) is where purchasing decisions are made. A high-converting PDP removes doubt and answers buyer questions before they become objections.</p>
        
        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">1. Clear Visual Hierarchy Above the Fold</h3>
        <p>High-resolution imagery, distinct price contrast, verified review stars, and obvious variant toggles.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">2. Sticky Mobile CTA</h3>
        <p>As buyers scroll down to read reviews or specifications, keep a thumb-friendly 'Add to Cart' bar pinned at the bottom of mobile screens.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">3. Risk Reversals & Trust Signals</h3>
        <p>Place shipping estimates, free return guarantees, and secure payment badges immediately under the primary buy button.</p>
      `
    },
    'article-5': {
      tag: 'UI/UX DESIGN',
      title: 'Mobile eCommerce UX: Why Desktop-First Thinking Falls Short',
      meta: '⏱ 5 min read • By Lead UI/UX Designer • Kinetic Duo Studio',
      content: `
        <p>Over 78% of modern D2C traffic originates from mobile devices. Yet many teams still design and review storefronts on widescreen 27-inch monitors first.</p>
        
        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">The Natural Thumb Zone</h3>
        <p>Crucial interactive elements (cart toggles, filters, checkout buttons) must be reachable within one-handed thumb reach at the bottom of the device.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Bottom Sheets Over Tiny Modals</h3>
        <p>Slide-up bottom sheets are vastly easier to dismiss and interact with than centered pop-up modals on mobile touchscreens.</p>
      `
    },
    'article-6': {
      tag: 'ANALYTICS & TRACKING',
      title: 'GA4 + Microsoft Clarity: Using Data to Understand Store Behavior',
      meta: '⏱ 9 min read • By Studio Duo • Kinetic Duo Studio',
      content: `
        <p>Quantitative numbers tell you WHAT is happening; qualitative recordings tell you WHY it is happening. Combining GA4 with Microsoft Clarity provides complete visibility.</p>
        
        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Configuring Custom DataLayers</h3>
        <p>Ensure your Shopify Liquid theme fires clean DataLayer events for view_item, add_to_cart, begin_checkout, and purchase with accurate item IDs and currencies.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Analyzing Rage-Clicks and Dead Clicks</h3>
        <p>Filter Clarity sessions by users who rage-clicked on unlinked badges or images to uncover unmet customer expectations.</p>
      `
    },
    'article-7': {
      tag: 'STRATEGY & GROWTH',
      title: 'When Should You Redesign Your Shopify Store?',
      meta: '⏱ 6 min read • By Studio Duo • Kinetic Duo Studio',
      content: `
        <p>Redesigning a storefront is an investment of time and capital. How do you know when it is time for a full ground-up build versus ongoing iterative optimization?</p>
        
        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Warning Sign 1: Bloated Legacy Theme Code</h3>
        <p>If your store runs on an outdated vintage theme pre-dating Online Store 2.0, adding new sections requires brittle developer hacks.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Warning Sign 2: Brand Evolution Mismatch</h3>
        <p>When your product line, average order value, or brand positioning has scaled, but the storefront still looks like a generic template.</p>
      `
    },
    'article-8': {
      tag: 'SHOPIFY DEVELOPMENT',
      title: 'Shopify Theme Customization vs. Custom Development: What Should You Choose?',
      meta: '⏱ 7 min read • By Lead Shopify Developer • Kinetic Duo Studio',
      content: `
        <p>Should you customize an off-the-shelf theme from the Shopify Theme Store or commission a custom Liquid 2.0 build from scratch?</p>
        
        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Off-the-Shelf Customization</h3>
        <p>Best for early-stage brands ($0 - $500k ARR) needing quick speed-to-market with standard product catalogs.</p>

        <h3 style="margin-top: 24px; color: var(--text-main); font-size: 1.25rem;">Bespoke Liquid Theme Development</h3>
        <p>Best for established D2C brands ($1M+ ARR) demanding sub-second load times, proprietary custom features, custom bundles, and zero third-party app dependencies.</p>
      `
    }
  };

  // Trigger Modal
  const readTriggers = document.querySelectorAll('.read-article-trigger');
  if (modalOverlay && readTriggers.length > 0) {
    readTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const articleId = btn.getAttribute('data-article-id');
        const data = blogArticlesData[articleId];
        if (!data) return;

        document.getElementById('modal-article-tag').innerText = data.tag;
        document.getElementById('modal-article-title').innerText = data.title;
        document.getElementById('modal-article-meta').innerText = data.meta;
        document.getElementById('modal-article-body').innerHTML = data.content;

        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeArticleModal() {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeArticleModal);
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeArticleModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
        closeArticleModal();
      }
    });
  }
}
