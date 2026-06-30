/* =============================================
   main.js – Portfolio interactivity & animations
   Security: Uses textContent / createElement only.
   No innerHTML, no dangerouslySetInnerHTML, no eval.
   ============================================= */

(function () {
  'use strict';

  // ── Premium Interactive Particle Background ─────────────────────────
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    var particles = [];
    var meteors = [];
    var mouseX = -9999;
    var mouseY = -9999;
    var time = 0;

    // Accent palette from design tokens
    var palette = [
      { r: 56, g: 189, b: 248 },   // --accent-2 cyan
      { r: 124, g: 58, b: 237 },    // --accent-1 violet
      { r: 34, g: 211, b: 238 },    // --accent-3 teal
      { r: 192, g: 132, b: 252 },   // light purple
      { r: 99, g: 102, b: 241 },    // indigo
    ];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track mouse for interactive repulsion
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    document.addEventListener('mouseleave', function () {
      mouseX = -9999;
      mouseY = -9999;
    });

    function createParticles() {
      particles = [];
      var count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 90);
      for (var i = 0; i < count; i++) {
        var col = palette[Math.floor(Math.random() * palette.length)];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          baseR: Math.random() * 1.8 + 0.6,
          r: 0,
          color: col,
          alpha: Math.random() * 0.35 + 0.1,
          phase: Math.random() * Math.PI * 2, // for pulsing
        });
      }
    }
    createParticles();
    window.addEventListener('resize', createParticles);

    // Spawn a meteor/shooting-star
    function spawnMeteor() {
      var startX = Math.random() * canvas.width * 0.7;
      var startY = -10;
      var col = palette[Math.floor(Math.random() * palette.length)];
      meteors.push({
        x: startX,
        y: startY,
        vx: 2.5 + Math.random() * 3,
        vy: 3.5 + Math.random() * 4,
        life: 1.0,
        decay: 0.008 + Math.random() * 0.006,
        length: 60 + Math.random() * 80,
        color: col,
        width: 1 + Math.random() * 1.5,
      });
    }

    // Periodically spawn meteors
    setInterval(function () {
      if (meteors.length < 3) spawnMeteor();
    }, 2500 + Math.random() * 3000);

    function drawParticles() {
      time += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Draw connection lines first (behind particles) ──
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            var opacity = 0.08 * (1 - dist / 150);
            var ci = particles[i].color;
            var cj = particles[j].color;
            var mr = Math.round((ci.r + cj.r) / 2);
            var mg = Math.round((ci.g + cj.g) / 2);
            var mb = Math.round((ci.b + cj.b) / 2);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(' + mr + ',' + mg + ',' + mb + ',' + opacity + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // ── Update and draw particles ──
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // Mouse magnetic repulsion
        var dmx = p.x - mouseX;
        var dmy = p.y - mouseY;
        var mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
        if (mouseDist < 140 && mouseDist > 0) {
          var force = (140 - mouseDist) / 140 * 0.8;
          p.vx += (dmx / mouseDist) * force * 0.15;
          p.vy += (dmy / mouseDist) * force * 0.15;
        }

        // Dampen velocity to prevent runaway
        p.vx *= 0.995;
        p.vy *= 0.995;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Pulsing radius and alpha
        var pulse = Math.sin(time * 1.5 + p.phase) * 0.3 + 1;
        p.r = p.baseR * pulse;
        var drawAlpha = p.alpha * (0.7 + 0.3 * Math.sin(time * 0.8 + p.phase));

        // Draw glow
        var c = p.color;
        var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        gradient.addColorStop(0, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (drawAlpha * 0.6) + ')');
        gradient.addColorStop(1, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + drawAlpha + ')';
        ctx.fill();
      }

      // ── Meteors / shooting stars ──
      for (var m = meteors.length - 1; m >= 0; m--) {
        var mt = meteors[m];
        mt.x += mt.vx;
        mt.y += mt.vy;
        mt.life -= mt.decay;

        if (mt.life <= 0 || mt.x > canvas.width + 100 || mt.y > canvas.height + 100) {
          meteors.splice(m, 1);
          continue;
        }

        var tailX = mt.x - (mt.vx / Math.sqrt(mt.vx * mt.vx + mt.vy * mt.vy)) * mt.length;
        var tailY = mt.y - (mt.vy / Math.sqrt(mt.vx * mt.vx + mt.vy * mt.vy)) * mt.length;

        var meteorGrad = ctx.createLinearGradient(tailX, tailY, mt.x, mt.y);
        var mc = mt.color;
        meteorGrad.addColorStop(0, 'rgba(' + mc.r + ',' + mc.g + ',' + mc.b + ',0)');
        meteorGrad.addColorStop(0.6, 'rgba(' + mc.r + ',' + mc.g + ',' + mc.b + ',' + (mt.life * 0.15) + ')');
        meteorGrad.addColorStop(1, 'rgba(255,255,255,' + (mt.life * 0.7) + ')');

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(mt.x, mt.y);
        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = mt.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Bright head glow
        var headGlow = ctx.createRadialGradient(mt.x, mt.y, 0, mt.x, mt.y, 6);
        headGlow.addColorStop(0, 'rgba(255,255,255,' + (mt.life * 0.5) + ')');
        headGlow.addColorStop(1, 'rgba(' + mc.r + ',' + mc.g + ',' + mc.b + ',0)');
        ctx.beginPath();
        ctx.arc(mt.x, mt.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = headGlow;
        ctx.fill();
      }

      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // ── Navbar Scroll Effect ─────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ── Active Nav Link on Scroll ────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-links a');

  function highlightNavLink() {
    const scrollPos = window.scrollY + 150;
    for (const section of sections) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        for (const link of navLinks) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        }
      }
    }
  }
  window.addEventListener('scroll', highlightNavLink, { passive: true });

  // ── Mobile Navigation ────────────────────────────────────────────────
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinksEl = document.getElementById('navLinks');

  if (mobileToggle && navLinksEl) {
    mobileToggle.addEventListener('click', function () {
      mobileToggle.classList.toggle('active');
      navLinksEl.classList.toggle('open');
    });

    for (const link of navLinks) {
      link.addEventListener('click', function () {
        mobileToggle.classList.remove('active');
        navLinksEl.classList.remove('open');
      });
    }
  }

  // ── Scroll Reveal Animation ──────────────────────────────────────────
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver(function (entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.15 });

  for (const el of animatedElements) {
    observer.observe(el);
  }

  // ── Smooth Scroll for Anchor Links ───────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ── Contact Form (sends via Web3Forms) ────────────────────────────────
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');

  if (form && statusEl) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameVal = (document.getElementById('contactName').value || '').trim();
      const emailVal = (document.getElementById('contactEmail').value || '').trim();
      const messageVal = (document.getElementById('contactMessage').value || '').trim();
      const submitBtn = document.getElementById('submitBtn');

      if (!nameVal || !emailVal || !messageVal) {
        statusEl.textContent = 'Please fill in all fields.';
        statusEl.className = 'form-status error';
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        statusEl.textContent = 'Please enter a valid email address.';
        statusEl.className = 'form-status error';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            statusEl.textContent = 'Message sent successfully! 🎉';
            statusEl.className = 'form-status success';
            form.reset();
          } else {
            statusEl.textContent = 'Something went wrong. Please try again.';
            statusEl.className = 'form-status error';
          }
        })
        .catch(function () {
          statusEl.textContent = 'Network error. Please try again.';
          statusEl.className = 'form-status error';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = '\u{1F4E4} Send Message';
          setTimeout(function () {
            statusEl.textContent = '';
            statusEl.className = 'form-status';
          }, 6000);
        });
    });
  }

  // ── Download Resume Button ───────────────────────────────────────────
  var resumeBtn = document.getElementById('downloadResume');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', function (e) {
      var href = resumeBtn.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
        var statusMsg = document.getElementById('formStatus');
        if (statusMsg) {
          statusMsg.textContent = 'Resume file is not available yet. Add resume.pdf to the portfolio folder.';
          statusMsg.className = 'form-status error';
          setTimeout(function () {
            statusMsg.textContent = '';
            statusMsg.className = 'form-status';
          }, 5000);
        }
      }
    });
  }
})();
