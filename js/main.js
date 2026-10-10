/**
 * Ideas2RealityWithVK - Main JavaScript
 * Handles navigation, interactive canvas, bento effects, skills tabs,
 * quick contact tools, toast engine, and animations.
 */

(function () {
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

  // ============================================
  // Toast Notification Engine
  // ============================================
  function ensureToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  }

  window.showToast = function (message, icon = '✨') {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast__icon">${icon}</span>
      <span class="toast__message">${message}</span>
    `;
    container.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }, 3500);
  };

  // ============================================
  // Mobile Navigation
  // ============================================
  function toggleMobileMenu() {
    const isOpen = navMenu.classList.contains('active');
    navMenu.classList.toggle('active');
    navOverlay.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  function closeMobileMenu() {
    if (!navMenu) return;
    navMenu.classList.remove('active');
    navOverlay && navOverlay.classList.remove('active');
    navToggle && navToggle.classList.remove('active');
    navToggle && navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileMenu);
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMobileMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // ============================================
  // Scroll Navigation Styling & Scroll-to-Top
  // ============================================
  let scrollTopBtn = null;

  function createScrollTopButton() {
    scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollTopBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    `;
    document.body.appendChild(scrollTopBtn);

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  createScrollTopButton();

  function updateNavOnScroll() {
    const currentScrollY = window.scrollY;

    if (nav) {
      if (currentScrollY > 50) {
        nav.style.background = 'rgba(5, 5, 8, 0.95)';
      } else {
        nav.style.background = 'rgba(5, 5, 8, 0.8)';
      }
    }

    if (scrollTopBtn) {
      if (currentScrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateNavOnScroll();
        ticking = false;
      });
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
          observer.unobserve(entry.target);
        }
      });
    }, options);

    return observer;
  }

  const revealObserver = createObserver();
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // ============================================
  // Animated Stats Counter
  // ============================================
  function initCounters() {
    const counters = document.querySelectorAll('.stat-item__number, [data-counter-target]');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetStr = el.getAttribute('data-target') || el.innerText;
          const targetNum = parseInt(targetStr.replace(/\D/g, ''), 10);
          const suffix = targetStr.replace(/[0-9]/g, '') || '+';

          if (!isNaN(targetNum)) {
            let start = 0;
            const duration = 1500;
            const startTime = performance.now();

            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out expo
              const current = Math.floor((1 - Math.pow(2, -10 * progress)) * targetNum);
              el.innerText = `${current}${suffix}`;

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                el.innerText = `${targetNum}${suffix}`;
              }
            }
            requestAnimationFrame(updateCounter);
          }
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  initCounters();

  // ============================================
  // Typewriter Subtitle Effect
  // ============================================
  function initTypewriter() {
    const typeTarget = document.querySelector('.typewriter-text');
    if (!typeTarget) return;

    const phrases = [
      'Embedded Systems Builder ⚡',
      'VFSTR ECE Student & Innovator 🎓',
      'Ideathon & Expo Champion 🏆',
      'IN-SPACe Rocketry Finalist 🚀',
      'IoT & Cloud AI Hardware Maker 🤖'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function type() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typeTarget.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 40;
      } else {
        typeTarget.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 80;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        typingSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 400; // Pause before new phrase
      }

      setTimeout(type, typingSpeed);
    }

    type();
  }

  initTypewriter();

  // ============================================
  // Interactive 3D Bento Card Tilt
  // ============================================
  function initCardTilt() {
    // Only enable on desktop devices with hover support
    if (window.matchMedia('(hover: none)').matches) return;

    const cards = document.querySelectorAll('.bento-card, .project-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  initCardTilt();

  // ============================================
  // Skills Matrix Filter Tabs
  // ============================================
  function initSkillTabs() {
    const tabBtns = document.querySelectorAll('.skill-tab-btn');
    const skillCards = document.querySelectorAll('.skill-bar-card');

    if (!tabBtns.length || !skillCards.length) return;

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        skillCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  }

  initSkillTabs();

  // ============================================
  // Quick Contact Actions: Copy to Clipboard & Email
  // ============================================
  function initQuickContact() {
    const copyBtns = document.querySelectorAll('.btn-action-copy, #copyEmailBtn');

    copyBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const emailToCopy = btn.getAttribute('data-email') || 'vishnukarthik6464@gmail.com';

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(emailToCopy);
          } else {
            // Fallback for non-https or older browsers
            const textArea = document.createElement('textarea');
            textArea.value = emailToCopy;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          }

          // Visual feedback on button
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          `;
          btn.style.borderColor = '#10b981';
          btn.style.color = '#34d399';

          window.showToast(`Email copied: ${emailToCopy}`, '📋');

          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.borderColor = '';
            btn.style.color = '';
          }, 2500);
        } catch (err) {
          console.error('Copy error:', err);
          window.showToast(`Please manually copy: ${emailToCopy}`, '⚠️');
        }
      });
    });
  }

  initQuickContact();

  // ============================================
  // Contact Form Submission (Google Forms)
  // ============================================
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSeRcrpltpP4eRexrWxpAIkPJW0SbrcjSo765Ec-jOwP29eRNQ/formResponse';
    const ENTRY = {
      name: 'entry.155630238',
      email: 'entry.45742907',
      type: 'entry.1677794794',
      message: 'entry.497922772'
    };

    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const successMsg = document.getElementById('formSuccess');
    const errorMsg = document.getElementById('formError');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const group = field.closest('.form-group');
        const isEmpty = !field.value.trim();
        const badEmail = field.type === 'email' && !field.value.includes('@');
        if (isEmpty || badEmail) {
          group && group.classList.add('has-error');
          valid = false;
        } else {
          group && group.classList.remove('has-error');
        }
      });

      if (!valid) {
        window.showToast('Please fill out all required fields properly.', '⚠️');
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.innerHTML = '<span class="btn-spinner"></span> Sending...';
      if (btnIcon) btnIcon.style.display = 'none';
      if (successMsg) successMsg.style.display = 'none';
      if (errorMsg) errorMsg.style.display = 'none';

      const body = new URLSearchParams();
      body.append(ENTRY.name, document.getElementById('name') ? document.getElementById('name').value : '');
      body.append(ENTRY.email, document.getElementById('email') ? document.getElementById('email').value : '');
      body.append(ENTRY.type, document.getElementById('type') ? document.getElementById('type').value : 'General');
      body.append(ENTRY.message, document.getElementById('message') ? document.getElementById('message').value : '');

      try {
        await fetch(FORM_ACTION, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        });

        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        form.reset();
        window.showToast('Message sent successfully! I will reply shortly.', '🚀');
      } catch (err) {
        if (errorMsg) errorMsg.style.display = 'block';
        console.error('Submission error:', err);
        window.showToast('Failed to send. Please use the quick email button.', '❌');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
        if (btnIcon) btnIcon.style.display = 'inline';
      }
    });
  }

  initContactForm();

  // ============================================
  // Interactive Background Canvas (Constellation)
  // ============================================
  function initBackgroundCanvas() {
    let canvas = document.getElementById('bg-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'bg-canvas';
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 45;
    const maxDistance = 140;

    let mouse = { x: null, y: null };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.6 + 0.8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Gentle mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            this.x -= (dx / dist) * 0.6;
            this.y -= (dy / dist) * 0.6;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 204, 0.4)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Only run canvas if device doesn't request reduced motion
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initBackgroundCanvas();
  }

  // ============================================
  // FAQ Accordion
  // ============================================
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-question') && otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('active');
        question.setAttribute('aria-expanded', !isOpen);
      });
    }
  });

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

  setActiveNavLink();

  console.log(`
  %c◆ Ideas2RealityWithVK %c
  Portfolio System active with Bento Grid & Cybercore UI.
  Happy Building! 🚀
  `,
    'color: #00ffcc; font-size: 16px; font-weight: bold;',
    'color: #a8b2d1; font-size: 12px;'
  );

})();
