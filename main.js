/* ══════════════════════════════════════════════
   MOONCLIQ — MAIN JS
   ══════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── ADVANCED PARTICLE NETWORK ──────────────────────── */
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');
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

  window.addEventListener('resize', () => {
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
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x pos within the element
      const y = e.clientY - rect.top;  // y pos within the element
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });

  /* ── NAVBAR ───────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const links     = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
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
  const nf  = document.getElementById('notifyForm');
  const nok = document.getElementById('notifySuccess');
  nf && nf.addEventListener('submit', e => {
    e.preventDefault();
    nf.style.display = 'none';
    nok.classList.add('show');
  });

  /* ── CONTACT FORM ─────────────────────────── */
  const cf  = document.getElementById('contactForm');
  const cok = document.getElementById('formSuccess');
  const sb  = document.getElementById('submitBtn');
  cf && cf.addEventListener('submit', e => {
    e.preventDefault();
    sb.textContent = 'Sending…'; sb.disabled = true;
    setTimeout(() => {
      sb.style.display = 'none';
      cok.classList.add('show');
      cf.reset();
    }, 900);
  });

  /* ── SMOOTH SCROLL ────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 78, behavior: 'smooth' }); }
    });
  });

})();
