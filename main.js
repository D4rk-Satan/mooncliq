/* ══════════════════════════════════════════════
   MOONCLIQ — MAIN JS
   ══════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── BUTTERY SMOOTH LENIS SCROLL (SILKY & RESPONSIVE) ── */
  let lenisInstance = null;
  if (typeof Lenis !== 'undefined') {
    lenisInstance = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      infinite: false,
    });

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }






  /* ── ADVANCED PARTICLE NETWORK ──────────────────────── */
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [], raf;
  let mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = (Math.random() * 30) + 1;
      this.vX = (Math.random() - 0.5) * 0.5;
      this.vY = (Math.random() - 0.5) * 0.5;
      this.color = Math.random() < 0.2 ? 'rgba(91,110,245,0.8)' : 'rgba(255,255,255,0.8)';
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    update() {
      // Upward drift
      this.y -= (0.2 + Math.abs(this.vY));

      // Horizontal sine-wave sway
      this.x += Math.sin(this.density) * 0.3;
      this.density += 0.01;

      // Wrap around edges smoothly
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;

      // Respawn at bottom if floats past top
      if (this.y < -10) this.y = canvas.height + 10;

      // Mouse parallax / interaction (subtle repulse)
      if (mouse.x != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let forceDirX = dx / dist;
          let forceDirY = dy / dist;
          let force = (mouse.radius - dist) / mouse.radius;
          let dirX = forceDirX * force * 1.5;
          let dirY = forceDirY * force * 1.5;
          this.x -= dirX;
          this.y -= dirY;
        }
      }
    }
  }

  function initParticles() {
    resize();
    particles = [];

    // Performance optimization: fewer stars for 60fps locked rendering
    const isMobile = window.innerWidth < 768;
    const density = isMobile ? 12000 : 8000;
    const maxStars = isMobile ? 60 : 200;

    const n = Math.min(Math.floor((canvas.width * canvas.height) / density), maxStars);

    for (let i = 0; i < n; i++) {
      let p = new Particle();
      p.size = Math.random() * 1.2 + 0.3;
      p.color = Math.random() < 0.3 ? 'rgba(34, 211, 238, 0.9)' : 'rgba(255, 255, 255, 0.6)';
      p.density = Math.random() * Math.PI * 2;
      p.vX = (Math.random() - 0.5) * 0.2;
      p.vY = (Math.random() - 0.5) * 0.2;
      particles.push(p);
    }
  }

  function animateParticles() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
      }
      if (raf) cancelAnimationFrame(raf);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    raf = requestAnimationFrame(animateParticles);
  }

  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth;
    if (currentWidth === lastWidth) return;
    lastWidth = currentWidth;
    clearTimeout(window._rt);
    window._rt = setTimeout(() => {
      initParticles();
      animateParticles();
    }, 200);
  });
  initParticles();
  animateParticles();

  /* ── 3D TILT EFFECT ───────────────────────── */

  const cards = document.querySelectorAll('.glass-card, .sol-card, .up-card, .about-card-primary');
  cards.forEach(card => {
    let isHovered = false;
    card.addEventListener('mouseenter', () => { isHovered = true; });
    card.addEventListener('mousemove', (e) => {
      if (!isHovered) return;
      window.requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = (y / (rect.height / 2)) * -4;
        const rotateY = (x / (rect.width / 2)) * 4;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      isHovered = false;
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });

  /* ── NAVBAR ───────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');

  let scrollScheduled = false;
  window.addEventListener('scroll', () => {
    if (!scrollScheduled) {
      scrollScheduled = true;
      window.requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
        scrollScheduled = false;
      });
    }
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  links.forEach(l => l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }));

  /* ── ACTIVE NAV ───────────────────────────── */
  const sections = document.querySelectorAll('section[id]');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.2, rootMargin: "-10% 0px -50% 0px" });

  sections.forEach(s => navObserver.observe(s));
  /* ── SCROLL REVEAL ────────────────────────── */
  const revealSels = [
    '.service-card', '.sol-card', '.up-card',
    '.about-card-primary', '.about-card-secondary',
    '.value-item', '.contact-panel', '.contact-form',
    '.notify-block', '.footer-col', '.about-card-icon-wrap'
  ].join(',');

  document.querySelectorAll(revealSels).forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 55);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ── STAGGER SERVICE CARDS ────────────────── */
  document.querySelectorAll('.services-grid .service-card').forEach((c, i) => {
    c.style.transitionDelay = `${i * 35}ms`;
  });

  /* ── NOTIFY FORM ──────────────────────────── */
  const nf = document.getElementById('notifyForm');
  const nok = document.getElementById('notifySuccess');
  nf && nf.addEventListener('submit', e => {
    e.preventDefault();
    const btn = nf.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Wait…'; btn.disabled = true;

    fetch("https://formsubmit.co/ajax/hello@mooncliq.com", {
      method: "POST",
      headers: { 'Accept': 'application/json' },
      body: new FormData(nf)
    })
      .then(res => res.json())
      .then(() => {
        nf.style.display = 'none';
        nok.classList.add('show');
      })
      .catch(() => {
        btn.textContent = originalText; btn.disabled = false;
      });
  });

  /* ── CONTACT FORM ─────────────────────────── */
  const cf = document.getElementById('contactForm');
  const cok = document.getElementById('formSuccess');
  const sb = document.getElementById('submitBtn');
  cf && cf.addEventListener('submit', e => {
    e.preventDefault();
    const originalHTML = sb.innerHTML;
    sb.innerHTML = 'Sending…'; sb.disabled = true;

    fetch("https://formsubmit.co/ajax/hello@mooncliq.com", {
      method: "POST",
      headers: { 'Accept': 'application/json' },
      body: new FormData(cf)
    })
      .then(res => res.json())
      .then(() => {
        sb.style.display = 'none';
        cok.classList.add('show');
        cf.reset();
      })
      .catch(() => {
        sb.innerHTML = 'Error! Try Again';
        sb.disabled = false;
      });
  });

  /* ── SMOOTH SCROLL (SYNCED WITH LENIS) ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#' || href === '') return;
      const t = document.querySelector(href);
      if (t) {
        e.preventDefault();
        if (lenisInstance) {
          lenisInstance.scrollTo(t, { offset: -78, duration: 1.0 });
        } else {
          window.scrollTo({ top: t.offsetTop - 78, behavior: 'smooth' });
        }
      }
    });
  });

  /* ── DAY/NIGHT THEME LOGIC (PERSISTENT VIA LOCALSTORAGE) ── */
  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(isDay, save = false) {
    if (isDay) {
      document.body.classList.add('day-mode');
      if (save) localStorage.setItem('mooncliq_theme', 'day');
    } else {
      document.body.classList.remove('day-mode');
      if (save) localStorage.setItem('mooncliq_theme', 'dark');
    }
  }

  // Initialize: check saved preference first, then system/time-based fallback
  const savedTheme = localStorage.getItem('mooncliq_theme');
  if (savedTheme) {
    applyTheme(savedTheme === 'day');
  } else {
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;
    applyTheme(isDayTime);
  }

  // Toggle handler
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isCurrentlyDay = document.body.classList.contains('day-mode');
      applyTheme(!isCurrentlyDay, true);
    });
  }

  /* ── CRM FEATURE MODAL INTERACTION ──────────────────────── */
  const crmCard = document.getElementById('up-crm');
  const crmModal = document.getElementById('crmModal');
  const closeCrmModal = document.getElementById('closeCrmModal');

  if (crmCard && crmModal) {
    crmCard.style.cursor = 'pointer';
    crmCard.addEventListener('click', () => {
      crmModal.classList.add('open');
      crmModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeCrmModal && crmModal) {
    closeCrmModal.addEventListener('click', (e) => {
      e.stopPropagation();
      crmModal.classList.remove('open');
      crmModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });

    crmModal.addEventListener('click', (e) => {
      if (e.target === crmModal) {
        crmModal.classList.remove('open');
        crmModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && crmModal.classList.contains('open')) {
        crmModal.classList.remove('open');
        crmModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

})();
