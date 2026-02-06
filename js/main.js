/**
 * Ideas2RealityWithVK - Main JavaScript
 * Handles navigation, animations, and interactivity
 */

(function() {
  'use strict';

  // ============================================
  // DOM Elements
  // ============================================
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');
  const navOverlay = document.querySelector('.nav__overlay');
  const navLinks = document.querySelectorAll('.nav__link');
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const faqItems = document.querySelectorAll('.faq-item');
  const contactForm = document.getElementById('contactForm');

  // ============================================
  // Mobile Navigation
  // ============================================
  function toggleMobileMenu() {
    const isOpen = navMenu.classList.contains('active');
    
    navMenu.classList.toggle('active');
    navOverlay.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', !isOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  function closeMobileMenu() {
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Event listeners for mobile menu
  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileMenu);
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close menu when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Close menu on window resize (if going to desktop)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });

  // ============================================
  // Scroll-based Navigation Styling
  // ============================================
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateNavOnScroll() {
    const currentScrollY = window.scrollY;
    
    // Add background opacity based on scroll
    if (currentScrollY > 50) {
      nav.style.background = 'rgba(5, 5, 8, 0.95)';
    } else {
      nav.style.background = 'rgba(5, 5, 8, 0.8)';
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNavOnScroll);
      ticking = true;
    }
  });

  // ============================================
  // Scroll Reveal Animations
  // ============================================
  function createObserver() {
    const options = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Unobserve after revealing (one-time animation)
          observer.unobserve(entry.target);
        }
      });
    }, options);

    return observer;
  }

  // Initialize observer for reveal animations
  const revealObserver = createObserver();
  
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#" or empty
      if (href === '#' || href === '') return;
      
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        const navHeight = nav ? nav.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // FAQ Accordion
  // ============================================
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        
        // Close all other FAQs
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          }
        });
        
        // Toggle current FAQ
        item.classList.toggle('active');
        question.setAttribute('aria-expanded', !isOpen);
      });
    }
  });

  // ============================================
  // Contact Form Validation
  // ============================================
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let isValid = true;
      const formGroups = contactForm.querySelectorAll('.form-group');
      
      formGroups.forEach(group => {
        const input = group.querySelector('.form-input, .form-textarea');
        
        if (input && input.hasAttribute('required')) {
          if (!validateField(input)) {
            isValid = false;
            group.classList.add('error');
          } else {
            group.classList.remove('error');
          }
        }
      });
      
      if (isValid) {
        // Show success message (in production, this would submit to a backend)
        showFormSuccess();
      }
    });
    
    // Real-time validation on blur
    contactForm.querySelectorAll('.form-input, .form-textarea').forEach(input => {
      input.addEventListener('blur', function() {
        const group = this.closest('.form-group');
        
        if (this.hasAttribute('required')) {
          if (!validateField(this)) {
            group.classList.add('error');
          } else {
            group.classList.remove('error');
          }
        }
      });
      
      // Clear error on input
      input.addEventListener('input', function() {
        const group = this.closest('.form-group');
        group.classList.remove('error');
      });
    });
  }

  function validateField(field) {
    const value = field.value.trim();
    
    if (!value) return false;
    
    // Email validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }
    
    return true;
  }

  function showFormSuccess() {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">✨</div>
        <h3 style="margin-bottom: 0.5rem; color: var(--accent-success);">Message Received!</h3>
        <p style="color: var(--text-muted);">
          Thanks for reaching out! Since this is a demo, 
          please contact me via social media for now.
        </p>
        <button class="btn btn--secondary" onclick="location.reload()" style="margin-top: 1rem;">
          Send Another
        </button>
      </div>
    `;
    
    // Replace form with success message
    contactForm.innerHTML = '';
    contactForm.appendChild(successMessage);
  }

  // ============================================
  // Active Page Indicator
  // ============================================
  function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
      }
    });
  }

  // Run on page load
  setActiveNavLink();

  // ============================================
  // Prefers Reduced Motion
  // ============================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function handleReducedMotion() {
    if (prefersReducedMotion.matches) {
      // Immediately reveal all elements without animation
      revealElements.forEach(element => {
        element.classList.add('revealed');
      });
    }
  }

  handleReducedMotion();
  prefersReducedMotion.addEventListener('change', handleReducedMotion);

  // ============================================
  // Console Easter Egg
  // ============================================
  console.log(`
  %c◆ Ideas2RealityWithVK %c

  Thanks for checking out the code! 
  If you're curious about how something works,
  feel free to explore.
  
  Happy Building! 🚀
  `, 
  'color: #00ffcc; font-size: 16px; font-weight: bold;',
  'color: #a8b2d1; font-size: 12px;'
  );

})();
