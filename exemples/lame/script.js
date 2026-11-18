/* ============ LAME — animations (vanilla JS, aucune dépendance) ============ */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.body.classList.add('loading');

  /* ---------- 1. Objets SVG générés ---------- */
  const scissorsSVG = `
    <svg viewBox="0 0 200 400" class="scissors">
      <g class="half b"><path class="blade" d="M107 182 L101 8 Q96 5 93 14 L91 182 Z"/><path class="line" d="M101 172 L128 286"/><ellipse class="line" cx="138" cy="326" rx="27" ry="38"/></g>
      <g class="half a"><path class="blade" d="M93 182 L99 8 Q104 5 107 14 L109 182 Z"/><path class="line" d="M99 172 L72 286"/><ellipse class="line" cx="62" cy="326" rx="27" ry="38"/></g>
      <circle class="pivot" cx="100" cy="172" r="6"/>
    </svg>`;
  $$('.js-scissors').forEach(el => (el.innerHTML = scissorsSVG));

  const teeth = $('.comb .teeth');
  if (teeth) {
    let html = '';
    for (let x = 32; x <= 200; x += 6) html += `<line x1="${x}" y1="94" x2="${x}" y2="158" stroke-width="2.4"/>`;
    for (let x = 212; x <= 368; x += 12) html += `<line x1="${x}" y1="94" x2="${x}" y2="158" stroke-width="5"/>`;
    teeth.innerHTML = html;
  }

  /* Motifs « cheveux » des cartes de la galerie */
  const gens = {
    strands: () => Array.from({ length: 22 }, (_, i) => {
      const x = 20 + i * 12.4, a = 18 + (i % 5) * 7;
      return `M${x} -10 C${x + a} 130 ${x - a} 260 ${x + a * .6} 410`;
    }),
    fade: () => Array.from({ length: 30 }, (_, i) => {
      const y = 22 + i * 12.4, w = 280 * Math.pow(i / 29, 1.6) + 6;
      return `M${150 - w / 2} ${y} H${150 + w / 2}`;
    }),
    waves: () => Array.from({ length: 18 }, (_, i) => {
      const y = 24 + i * 21; let d = `M-10 ${y}`;
      for (let x = -10, k = 0; x < 310; x += 32, k++) d += ` Q${x + 16} ${y + (k % 2 ? 15 : -15)} ${x + 32} ${y}`;
      return d;
    }),
    curls: () => Array.from({ length: 12 }, (_, i) => {
      const cx = 55 + (i % 3) * 95, cy = 55 + Math.floor(i / 3) * 97; let d = '';
      for (let t = 0; t < Math.PI * 6; t += .3) {
        const r = t * 2.3; d += `${t ? 'L' : 'M'}${(cx + Math.cos(t + i) * r).toFixed(1)} ${(cy + Math.sin(t + i) * r).toFixed(1)} `;
      }
      return d;
    }),
    braid: () => Array.from({ length: 12 }, (_, i) => {
      const cx = 50 + Math.floor(i / 4) * 100, ph = (i % 4) * Math.PI / 2; let d = '';
      for (let y = -10; y <= 410; y += 8) d += `${y > -10 ? 'L' : 'M'}${(cx + Math.sin(y * .045 + ph) * 30).toFixed(1)} ${y} `;
      return d;
    }),
    rings: () => Array.from({ length: 13 }, (_, i) => {
      const r = 12 + i * 13;
      return `M${150 - r} 200 a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;
    }),
  };
  $$('.card[data-gen]').forEach(card => {
    const paths = (gens[card.dataset.gen] || gens.strands)();
    $('.card-art', card).innerHTML = `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">${
      paths.map((d, i) => `<path d="${d}" pathLength="1" style="transition-delay:${i * 45}ms"/>`).join('')}</svg>`;
  });

  /* Marquee */
  const words = ['Coupe', 'Barbe', 'Couleur', 'Soin', 'Rasage', 'Dégradé'];
  const marquees = $$('.marquee-row').map((row, r) => {
    const inner = $('.marquee-inner', row);
    const seq = (r ? [...words].reverse() : words).map(w => `${w}<i>✂</i>`).join('');
    inner.innerHTML = seq.repeat(4);
    return { inner, dir: +row.dataset.dir, x: 0, half: 0 };
  });

  /* ---------- 2. Découpe du texte en mots / lettres ---------- */
  $$('[data-split]').forEach(el => {
    const chars = el.dataset.split === 'chars';
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        (chars ? [...n.textContent] : n.textContent.split(/(\s+)/)).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) return frag.append(' ');
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = p;
          s.style.transitionDelay = `${i++ * (chars ? 70 : 28)}ms`;
          w.append(s); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
  });

  /* Citation : mots révélés au scroll */
  const scrub = $('[data-scrub]');
  let scrubWords = [];
  if (scrub) {
    scrub.innerHTML = scrub.textContent.trim().split(/\s+/).map(w => `<span class="sw">${w}</span>`).join(' ');
    scrubWords = $$('.sw', scrub);
  }

  /* ---------- 3. Chargement ---------- */
  const startObservers = () => {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.dataset.count) countUp(e.target);
      io.unobserve(e.target);
    }), { threshold: .15 });
    $$('.reveal, [data-split]:not(.sp), .card, [data-count]').forEach(el => io.observe(el));
  };

  const countUp = el => {
    const end = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = performance.now(), dur = 1800;
    const tick = now => {
      const t = clamp((now - t0) / dur), e = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(end * e).toLocaleString('fr-FR') + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    reduced ? (el.textContent = end.toLocaleString('fr-FR') + suffix) : requestAnimationFrame(tick);
  };

  const finishLoading = () => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    setTimeout(startObservers, reduced ? 0 : 500);
  };
  const loaderCount = $('.loader-count'), loaderBar = $('.loader-bar');
  if (reduced) finishLoading();
  else {
    const t0 = performance.now(), dur = 1500;
    const tick = now => {
      const t = clamp((now - t0) / dur), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      loaderCount.textContent = Math.round(e * 100);
      loaderBar.style.transform = `scaleX(${e})`;
      t < 1 ? requestAnimationFrame(tick) : setTimeout(finishLoading, 200);
    };
    requestAnimationFrame(tick);
    setTimeout(() => document.body.classList.contains('loaded') || finishLoading(), 4000); // filet de sécurité
  }

  /* ---------- 4. Curseur personnalisé + effets magnétiques ---------- */
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  const cursor = $('.cursor'), cursorLabel = $('.cursor-label');
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; cursor.classList.add('on'); }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('on'));

  if (finePointer) {
    document.addEventListener('pointerover', e => {
      const labelled = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, input, select');
      cursor.classList.toggle('has-label', !!labelled);
      cursor.classList.toggle('hover', !labelled && !!link);
      if (labelled) cursorLabel.textContent = labelled.dataset.cursor;
    });

    if (!reduced) {
      $$('.magnetic').forEach(el => {
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .35}px, ${(e.clientY - r.top - r.height / 2) * .5}px)`;
          el.style.transition = 'transform .15s';
        });
        el.addEventListener('pointerleave', () => {
          el.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1)'; el.style.transform = '';
        });
      });

      $$('.tilt').forEach(el => {
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
          el.style.transition = 'transform .15s, border-color .5s, background .5s';
          el.style.transform = `perspective(900px) rotateY(${px * 14}deg) rotateX(${-py * 14}deg) scale(1.03)`;
        });
        el.addEventListener('pointerleave', () => {
          el.style.transition = 'transform .8s cubic-bezier(.2,.8,.2,1), border-color .5s, background .5s'; el.style.transform = '';
        });
      });
    }
  }

  /* ---------- 5. Canvas « mèches » du hero ---------- */
  const cv = $('#hair'), ctx = cv.getContext('2d');
  let W = 0, H = 0;
  const strands = Array.from({ length: 64 }, () => ({
    x: Math.random(), ph: Math.random() * 6.28, amp: 20 + Math.random() * 70,
    sp: .25 + Math.random() * .5, f: .6 + Math.random() * 1.2,
    a: .05 + Math.random() * .2, w: .5 + Math.random() * 1.1,
  }));
  const sizeCanvas = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const drawHair = t => {
    ctx.clearRect(0, 0, W, H);
    const SEG = 22;
    for (const s of strands) {
      ctx.beginPath();
      for (let j = 0; j <= SEG; j++) {
        const k = j / SEG, y = k * H;
        let x = s.x * W + Math.sin(k * 4 * s.f + t * s.sp + s.ph) * s.amp * k;
        const dx = x - mx, dy = y - my;
        x += dx / (Math.abs(dx) + 60) * 80 * Math.exp(-(dx * dx + dy * dy) / 26000);
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = `rgba(60,36,18,${s.a * 1.3})`; ctx.lineWidth = s.w; ctx.stroke();
    }
  };

  /* ---------- 6. Boucle de scroll ---------- */
  const hero = $('.hero'), heroTop = $('.hero-top'), heroSc = $('.hero-object .js-scissors'), heroScSvg = $('.scissors', heroSc);
  const heroImg = $('.hero-photo img');
  const stage = $('.stage'), stageObj = $('.stage-obj'), stageItems = $$('[data-i]', stage), stageNum = $('.stage-num'), stageSc = $('.stage .scissors');
  const gallery = $('.gallery'), track = $('.gallery-track');
  const salon = $('.salon'), bar = $('.scroll-bar');
  const navLinks = $$('.nav-link'), sections = navLinks.map(a => $(a.getAttribute('href')));
  let vh = innerHeight, sy = scrollY, sStage = 0, sGal = 0, sSalon = 0, stageIdx = -1, trackMax = 0, docH = 1;

  const measure = () => {
    vh = innerHeight; sizeCanvas();
    trackMax = Math.max(0, track.scrollWidth - innerWidth);
    docH = document.documentElement.scrollHeight - vh;
    marquees.forEach(m => (m.half = m.inner.scrollWidth / 2));
  };
  const prog = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / (r.height - vh)); };

  const frame = now => {
    const t = now / 1000, y = scrollY;
    const vel = y - sy;
    sy = lerp(sy, y, reduced ? 1 : .1);

    // curseur
    cx = lerp(cx, mx, .22); cy = lerp(cy, my, .22);
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;

    bar.style.transform = `scaleX(${clamp(y / docH)})`;

    // hero
    if (sy < vh * 1.1) {
      if (!reduced) drawHair(t);
      const hp = sy / vh, nx = mx / innerWidth - .5, ny = my / vh - .5;
      heroTop.style.transform = `translateY(${sy * .35}px) scale(${1 - hp * .15})`;
      heroTop.style.opacity = 1 - hp * 1.2;
      heroSc.style.transform = `translateY(${sy * -.25}px) rotateY(${nx * 40}deg) rotateX(${-ny * 30}deg) rotate(${-18 + hp * 200 + nx * 10}deg)`;
      if (heroImg) heroImg.style.transform = `translateY(${-sy * .12}px)`;
      heroScSvg.style.setProperty('--open', `${10 + Math.abs(Math.sin(t * 1.4)) * 14 + hp * 20}deg`);
    }

    // marquee : accélère avec la vitesse de scroll
    marquees.forEach(m => {
      if (!m.half) return;
      m.x += (reduced ? 0 : 1.2 + Math.abs(vel) * .12) * m.dir;
      if (m.x <= -m.half) m.x += m.half; if (m.x > 0) m.x -= m.half;
      m.inner.style.transform = `translateX(${m.x}px) skewX(${clamp(vel * -.08, -12, 12)}deg)`;
    });

    // stage : objet central
    sStage = lerp(sStage, prog(stage), reduced ? 1 : .09);
    const idx = Math.min(2, Math.floor(sStage * 3)), local = sStage * 3 - idx;
    if (idx !== stageIdx) {
      stageIdx = idx;
      stageItems.forEach(el => el.classList.toggle('active', +el.dataset.i === idx));
      stageNum.textContent = `0${idx + 1}`;
    }
    stage.style.setProperty('--p', sStage.toFixed(4));
    stageObj.style.transform = `rotateY(${(local - .5) * 50}deg) rotateX(${Math.sin(sStage * 6.28) * 12}deg) rotate(${(local - .5) * 36 + (idx === 0 ? 0 : -8)}deg)`;
    stageSc.style.setProperty('--open', `${8 + Math.abs(Math.sin(sStage * 28)) * 20}deg`);

    // galerie horizontale
    sGal = lerp(sGal, prog(gallery), reduced ? 1 : .09);
    track.style.transform = `translateX(${-sGal * trackMax}px) skewX(${clamp((prog(gallery) - sGal) * -40, -6, 6)}deg)`;

    // citation
    if (scrubWords.length) {
      const r = scrub.getBoundingClientRect();
      const qp = clamp((vh * .85 - r.top) / (r.height + vh * .35));
      scrubWords.forEach((w, i) => (w.style.opacity = qp * scrubWords.length > i ? 1 : .14));
    }

    // salon : cercle
    sSalon = lerp(sSalon, prog(salon), reduced ? 1 : .1);
    const c = clamp(sSalon / .7); salon.style.setProperty('--c', (c * c * (3 - 2 * c)).toFixed(4));

    // nav active
    let active = 0;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * .5) active = i; });
    navLinks.forEach((a, i) => a.classList.toggle('active', i === active));

    requestAnimationFrame(frame);
  };

  addEventListener('resize', measure);
  addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
  requestAnimationFrame(frame);

  /* ---------- 7. Formulaire (démo, rien n'est envoyé) ---------- */
  const form = $('.booking');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const msg = $('.form-msg', form), roll = $('.roll', form);
    if (!form.nom.value.trim() || !form.tel.value.trim()) {
      msg.textContent = 'Merci d\'indiquer votre nom et votre téléphone.';
      return;
    }
    roll.dataset.t = roll.textContent = 'Demande envoyée ✓';
    msg.textContent = `Merci ${form.nom.value.trim()}, on vous rappelle pour confirmer. (Démo : aucune donnée n'est envoyée.)`;
    form.reset();
  });
})();
