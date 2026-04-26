/* ============================================================
   TROY · STUDIO v2 — Animation Engine
   GSAP 3.12 · ScrollTrigger · 3D Interactions
   ============================================================
   SECTIONS:
   0.  Init & Config
   1.  Film Grain
   2.  Custom Cursor
   3.  Nav Scroll
   4.  Hero Master Timeline
   5.  Photo 3D Tilt (mouse)
   6.  Parallax Orbs
   7.  Count-up Stats
   8.  Servicios Cards — 3D Tilt + Scroll
   9.  Proyectos Cards — 3D Tilt + Scroll
   10. Historia Section
   11. Stack Grid
   12. Contacto CTA
   13. Floating Loops (breathing)
   14. Scroll Progress
   15. WhatsApp Float Button
   ============================================================ */

/* ── 0. INIT ──────────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* Timing constants — edit here to change feel globally */
const T = {
  delay:   0.25,
  dur:     1.0,
  stagger: 0.09,
  ease:    "expo.out",
  ease2:   "power3.out",
  scrIn:   "top 84%",
};

/* ── 1. FILM GRAIN ────────────────────────────────────────── */
(function grain() {
  const canvas = document.getElementById("noise-canvas");
  const ctx    = canvas.getContext("2d");
  if (!canvas || !ctx) return;

  const grainScale = window.devicePixelRatio > 1 ? 0.35 : 0.45;
  const targetFps = 12;
  const frameBudget = 1000 / targetFps;
  let lastFrame = 0;

  function resize() {
    canvas.width = Math.max(1, Math.floor(window.innerWidth * grainScale));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * grainScale));
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.imageSmoothingEnabled = false;
  }
  resize();
  window.addEventListener("resize", resize);
  (function draw(now = 0) {
    if (now - lastFrame < frameBudget) {
      requestAnimationFrame(draw);
      return;
    }
    lastFrame = now;
    const w = canvas.width, h = canvas.height;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(draw);
  })();
})();

/* ── 2. CUSTOM CURSOR ─────────────────────────────────────── */
(function cursor() {
  const ring = document.getElementById("cursor");
  const dot  = document.getElementById("cursor-dot");
  if (!ring) return;
  let mx = -100, my = -100, rx = -100, ry = -100;
  window.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    gsap.to(dot, { x: mx, y: my, duration: 0.04, ease: "none" });
  });
  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
    gsap.set(ring, { x: rx, y: ry });
  });
  document.querySelectorAll("a, button, .pcard, .stool, .scard, .channel-btn, .photo-frame")
    .forEach(el => {
      el.addEventListener("mouseenter", () => gsap.to(ring, { scale: 1.8, opacity: 0.5, duration: 0.3 }));
      el.addEventListener("mouseleave", () => gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 }));
    });
})();

/* ── 3. NAV SCROLL ────────────────────────────────────────── */
(function nav() {
  const nav = document.getElementById("nav");
  ScrollTrigger.create({
    start: "80px top",
    onEnter:     () => nav.classList.add("scrolled"),
    onLeaveBack: () => nav.classList.remove("scrolled"),
  });
  gsap.from(nav, { y: -60, opacity: 0, duration: 1, delay: 0.05, ease: T.ease });
})();

/* ── 4. HERO MASTER TIMELINE ──────────────────────────────── */
(function hero() {
  const tl = gsap.timeline({ delay: T.delay });

  tl.to("#hero-coords",   { opacity: 1, y: 0, duration: 0.8, ease: T.ease2 }, 0)
    .to("#hero-tag",      { opacity: 1, y: 0, duration: 0.6, ease: T.ease  }, 0.2)
    .to(".hero__name-script",
                          { opacity: 1, y: 0, duration: 0.9, ease: T.ease  }, 0.3)
    .to("#name-block",    { opacity: 1, y: 0, duration: 1.1, ease: T.ease  }, 0.45)
    .to("#hero-tagline",  { opacity: 1, y: 0, duration: 0.9, ease: T.ease2 }, 0.62)
    .to("#hero-actions",  { opacity: 1, y: 0, duration: 0.8, ease: T.ease  }, 0.78)
    .to("#hero-stats",    { opacity: 1, y: 0, duration: 0.8, ease: T.ease  }, 0.9)
    .to("#scroll-hint",   { opacity: 1, y: 0, duration: 0.6, ease: T.ease2 }, 1.2);

  /* Hero photo frame (copy) */
  tl.to("#hero-photo-frame", {
    opacity: 1, x: 0, rotateY: 0,
    duration: 1.3, ease: T.ease,
  }, 0.4);

  /* Hero floating badges stagger */
  tl.to(["#hero-pb1","#hero-pb2","#hero-pb3"], {
    opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: "back.out(1.4)",
  }, 0.9);

  /* Orbs entrance */
  tl.from(".hero__orb--1", { scale: 0.2, opacity: 0, duration: 2.5, ease: T.ease }, 0)
    .from(".hero__orb--2", { scale: 0.2, opacity: 0, duration: 2.5, ease: T.ease }, 0.2);
})();

/* ── 4B. PAGE TECH LAYER ─────────────────────────────────── */
(function pageTechLayer() {
  const layer = document.getElementById("page-tech-bg");
  const hero = document.getElementById("hero");
  if (!layer) return;

  const syncLayerStart = () => {
    if (hero) {
      layer.style.top = `${hero.offsetHeight}px`;
    }
  };

  syncLayerStart();
  window.addEventListener("load", syncLayerStart);
  window.addEventListener("resize", syncLayerStart);
  if (window.ResizeObserver && hero) {
    const observer = new ResizeObserver(syncLayerStart);
    observer.observe(hero);
  }

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const nodeCount = isMobile ? 12 : 26;
  const codeCount = isMobile ? 8 : 18;

  const codeTokens = [
    "const", "async", "await", "return", "JSON", "API", "n8n",
    "//", "<>", "[]", "{}", "POST", "GET", "AI", "flow", "cache"
  ];

  const zones = [
    [4, 16],
    [14, 28],
    [28, 42],
    [40, 56],
    [54, 70],
    [68, 82],
    [80, 94],
  ];

  const rand = gsap.utils.random;
  const makeItem = (className, top, left, text) => {
    const el = document.createElement("span");
    el.className = className;
    el.style.top = `${top}%`;
    el.style.left = `${left}%`;
    if (text) el.textContent = text;
    layer.appendChild(el);
    return el;
  };

  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    const zone = zones[i % zones.length];
    const top = rand(zone[0], zone[1]);
    const left = rand(4, 96);
    const tone = i % 3 === 0 ? "tech-node--purple" : i % 3 === 1 ? "tech-node--green" : "";
    const node = makeItem(`page-tech-item tech-node ${tone}`, top, left);
    const size = rand(8, 14);
    node.style.width = `${size}px`;
    node.style.height = `${size}px`;
    node.style.opacity = String(rand(0.35, 0.7));
    nodes.push(node);

    gsap.to(node, {
      x: rand(-18, 18),
      y: rand(-28, 28),
      duration: rand(4.8, 9.2),
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: rand(0, 2.4),
    });

    gsap.to(node, {
      scale: rand(0.82, 1.16),
      opacity: rand(0.3, 0.8),
      duration: rand(2.8, 5.2),
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: rand(0, 1.8),
    });
  }

  for (let i = 0; i < codeCount; i++) {
    const zone = zones[(i + 1) % zones.length];
    const top = rand(zone[0], zone[1]);
    const left = rand(6, 88);
    const token = codeTokens[i % codeTokens.length];
    const tone = i % 3 === 0 ? "tech-code--soft" : i % 3 === 1 ? "tech-code--violet" : "tech-code--lime";
    const code = makeItem(`page-tech-item tech-code ${tone}`, top, left, token);
    code.style.opacity = String(rand(0.22, 0.48));

    gsap.to(code, {
      x: rand(-24, 24),
      y: rand(-18, 18),
      rotation: rand(-6, 6),
      duration: rand(5.5, 10),
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: rand(0, 2.8),
    });

    gsap.to(code, {
      opacity: rand(0.18, 0.62),
      duration: rand(3, 6),
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: rand(0, 2),
    });
  }

  const halo1 = makeItem("page-tech-item tech-layer-halo tech-layer-halo--1", 6, 2);
  const halo2 = makeItem("page-tech-item tech-layer-halo tech-layer-halo--2", 26, 78);
  const halo3 = makeItem("page-tech-item tech-layer-halo tech-layer-halo--3", 68, 28);

  gsap.to(halo1, { x: "+=80", y: "+=40", duration: 12, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(halo2, { x: "-=100", y: "+=24", duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });
  gsap.to(halo3, { x: "+=56", y: "-=30", duration: 15, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.1 });

  const sectionThemes = [
    {
      id: "servicios",
      scene: "circuit",
      grid: "rgba(0,212,255,.03)",
      scanA: "rgba(0,212,255,.12)",
      scanB: "rgba(124,58,237,.22)",
      scanC: "rgba(0,255,204,.12)",
      halo1: "rgba(0,212,255,.25)",
      halo2: "rgba(124,58,237,.18)",
      halo3: "rgba(0,255,136,.12)",
      drift: 0.22,
      mouse: 0.7,
      energy: 1.0,
    },
    {
      id: "proyectos",
      scene: "constellation",
      grid: "rgba(0,255,204,.05)",
      scanA: "rgba(0,255,204,.08)",
      scanB: "rgba(0,212,255,.15)",
      scanC: "rgba(124,58,237,.10)",
      halo1: "rgba(0,255,204,.12)",
      halo2: "rgba(0,212,255,.11)",
      halo3: "rgba(124,58,237,.09)",
      drift: 0.3,
      mouse: 0.85,
      energy: 1.12,
    },
    {
      id: "historia",
      scene: "memory",
      grid: "rgba(124,58,237,.04)",
      scanA: "rgba(124,58,237,.10)",
      scanB: "rgba(255,107,53,.12)",
      scanC: "rgba(0,212,255,.08)",
      halo1: "rgba(124,58,237,.16)",
      halo2: "rgba(255,107,53,.10)",
      halo3: "rgba(0,212,255,.08)",
      drift: 0.2,
      mouse: 0.55,
      energy: 0.9,
    },
    {
      id: "stack",
      scene: "lattice",
      grid: "rgba(0,255,136,.05)",
      scanA: "rgba(0,255,136,.08)",
      scanB: "rgba(0,212,255,.12)",
      scanC: "rgba(124,58,237,.08)",
      halo1: "rgba(0,255,136,.12)",
      halo2: "rgba(0,212,255,.10)",
      halo3: "rgba(124,58,237,.08)",
      drift: 0.34,
      mouse: 0.95,
      energy: 1.18,
    },
    {
      id: "contacto",
      scene: "burst",
      grid: "rgba(255,107,53,.05)",
      scanA: "rgba(255,107,53,.09)",
      scanB: "rgba(0,255,136,.12)",
      scanC: "rgba(0,212,255,.08)",
      halo1: "rgba(255,107,53,.12)",
      halo2: "rgba(0,255,136,.10)",
      halo3: "rgba(0,212,255,.08)",
      drift: 0.26,
      mouse: 1.0,
      energy: 1.05,
    },
  ];

  const applyTheme = theme => {
    if (!theme) return;
    layer.dataset.theme = theme.id;
    layer.dataset.scene = theme.scene;
    layer.style.setProperty("--tech-grid", theme.grid);
    layer.style.setProperty("--tech-scan-a", theme.scanA);
    layer.style.setProperty("--tech-scan-b", theme.scanB);
    layer.style.setProperty("--tech-scan-c", theme.scanC);
    layer.style.setProperty("--halo-1", theme.halo1);
    layer.style.setProperty("--halo-2", theme.halo2);
    layer.style.setProperty("--halo-3", theme.halo3);
  };

  const sectionState = {
    index: 0,
    progress: 0,
    theme: sectionThemes[0],
  };

  applyTheme(sectionThemes[0]);

  const canvas = document.getElementById("page-tech-canvas");
  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  if (!canvas || !ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const frameBudget = isMobile ? 42 : 30;
  const points = [];
  const beams = [];
  const shards = [];
  let canvasW = 0;
  let canvasH = 0;
  let scrollDepth = 0;
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY || 0;
  let lastFrameTime = 0;
  const mouse = {
    x: 0,
    y: 0,
    active: false,
    vx: 0,
    vy: 0,
    lastX: 0,
    lastY: 0,
    sx: 0,
    sy: 0,
    tx: 0,
    ty: 0,
    trail: [],
  };

  const resizeCanvas = () => {
    const rect = layer.getBoundingClientRect();
    canvasW = Math.max(1, rect.width);
    canvasH = Math.max(1, rect.height);
    canvas.width = Math.floor(canvasW * dpr);
    canvas.height = Math.floor(canvasH * dpr);
    canvas.style.width = `${canvasW}px`;
    canvas.style.height = `${canvasH}px`;
    if (ctx.resetTransform) {
      ctx.resetTransform();
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.scale(dpr, dpr);
  };

  const syncScroll = () => {
    const currentY = window.scrollY || 0;
    scrollVelocity = currentY - lastScrollY;
    lastScrollY = currentY;
    scrollDepth = Math.max(0, currentY - (hero ? hero.offsetHeight : 0));
  };

  const syncMouse = e => {
    mouse.active = true;
    mouse.vx = e.clientX - mouse.lastX;
    mouse.vy = e.clientY - mouse.lastY;
    mouse.lastX = e.clientX;
    mouse.lastY = e.clientY;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
    if (mouse.trail.length === 0) {
      mouse.sx = e.clientX;
      mouse.sy = e.clientY;
    }
  };

  window.addEventListener("mousemove", syncMouse, { passive: true });
  window.addEventListener("mouseleave", () => { mouse.active = false; });
  window.addEventListener("blur", () => { mouse.active = false; });

  sectionThemes.forEach((theme, index) => {
    ScrollTrigger.create({
      trigger: `#${theme.id}`,
      start: "top 78%",
      end: "bottom 22%",
      onEnter: () => {
        sectionState.index = index;
        sectionState.theme = theme;
        applyTheme(theme);
      },
      onEnterBack: () => {
        sectionState.index = index;
        sectionState.theme = theme;
        applyTheme(theme);
      },
      onUpdate: self => {
        if (self.isActive) {
          sectionState.index = index;
          sectionState.progress = self.progress;
          sectionState.theme = theme;
        }
      },
    });
  });

  const makePoint = (type = "cyan") => {
    const edge = Math.random() < 0.5;
    return {
      x: edge ? Math.random() * canvasW : rand(canvasW * 0.05, canvasW * 0.95),
      y: rand(canvasH * 0.04, canvasH * 0.96),
      vx: rand(-0.16, 0.16),
      vy: rand(-0.12, 0.12),
      r: rand(1.4, 4.8),
      type,
      pulse: rand(0, Math.PI * 2),
    };
  };

  const makeBeam = () => ({
    x: rand(canvasW * 0.04, canvasW * 0.96),
    y: rand(-canvasH * 0.25, canvasH),
    len: rand(70, 220),
    speed: rand(0.7, 2.1),
    tilt: rand(-0.24, 0.24),
    width: rand(0.7, 1.9),
    alpha: rand(0.06, 0.22),
    hue: Math.random() > 0.5 ? "0,212,255" : "124,58,237",
  });

  const makeShard = () => ({
    x: rand(canvasW * 0.02, canvasW * 0.98),
    y: rand(-canvasH * 0.2, canvasH),
    len: rand(90, 260),
    width: rand(1, 2.4),
    vx: rand(-0.7, 0.7),
    vy: rand(2.4, 5.4),
    alpha: rand(0.1, 0.28),
    hue: Math.random() > 0.5 ? "0,212,255" : Math.random() > 0.5 ? "124,58,237" : "0,255,136",
    spin: rand(-10, 10),
  });

  const initField = () => {
    points.length = 0;
    beams.length = 0;
    shards.length = 0;
    const totalPoints = isMobile ? 24 : 54;
    const totalBeams = isMobile ? 8 : 16;
    const totalShards = isMobile ? 12 : 26;

    for (let i = 0; i < totalPoints; i++) {
      const type = i % 3 === 0 ? "purple" : i % 3 === 1 ? "green" : "cyan";
      points.push(makePoint(type));
    }

    for (let i = 0; i < totalBeams; i++) {
      beams.push(makeBeam());
    }

    for (let i = 0; i < totalShards; i++) {
      shards.push(makeShard());
    }
  };

  const draw = (now = 0) => {
    if (now - lastFrameTime < frameBudget) {
      requestAnimationFrame(draw);
      return;
    }
    lastFrameTime = now;
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const theme = sectionState.theme || sectionThemes[0];
    const sectionLift = 1 + (theme.energy || 1) * (0.15 + sectionState.progress * 0.55);
    const scrollDrift = Math.min(scrollDepth * (0.12 + theme.drift * 0.16), canvasH * 0.58);
    const scrollPush = Math.min(Math.abs(scrollVelocity) * 0.08, 6.5) * sectionLift;
    const layerRect = layer.getBoundingClientRect();
    const mouseX = mouse.active ? mouse.tx - layerRect.left : canvasW * 0.5;
    const mouseY = mouse.active ? mouse.ty - layerRect.top : canvasH * 0.35;
    const mouseRadius = (isMobile ? 150 : 260) * (0.8 + sectionState.progress * 0.7);
    const mouseStrength = (theme.mouse || 0.7) * 0.06;
    mouse.sx += (mouse.tx - mouse.sx) * 0.08;
    mouse.sy += (mouse.ty - mouse.sy) * 0.08;
    if (mouse.active) {
      mouse.trail.unshift({ x: mouse.sx - layerRect.left, y: mouse.sy - layerRect.top, life: 1 });
      if (mouse.trail.length > (isMobile ? 8 : 14)) mouse.trail.pop();
    } else {
      mouse.trail.forEach(point => { point.life *= 0.92; });
      mouse.trail = mouse.trail.filter(point => point.life > 0.12);
    }
    ctx.translate(0, -(scrollDrift % canvasH));

    const drawScene = () => {
      const scene = theme.scene;
      if (scene === "circuit") {
        const stepY = isMobile ? 72 : 56;
        const stepX = isMobile ? 110 : 88;
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 0.8;
        for (let y = 0; y < canvasH; y += stepY) {
          const hue = y % (stepY * 2) === 0 ? "0,212,255" : "124,58,237";
          ctx.strokeStyle = `rgba(${hue},.08)`;
          ctx.beginPath();
          ctx.moveTo(0, y + Math.sin((scrollDepth + y) * 0.01) * 5);
          ctx.lineTo(canvasW, y + Math.sin((scrollDepth + y) * 0.01) * 5);
          ctx.stroke();
        }
        for (let x = 0; x < canvasW; x += stepX) {
          ctx.strokeStyle = "rgba(0,255,204,.06)";
          ctx.beginPath();
          ctx.moveTo(x + Math.sin((scrollDepth + x) * 0.01) * 4, 0);
          ctx.lineTo(x + Math.sin((scrollDepth + x) * 0.01) * 4, canvasH);
          ctx.stroke();
        }
        ctx.restore();
      } else if (scene === "constellation") {
        ctx.save();
        ctx.globalAlpha = 0.75;
        const orbitCount = isMobile ? 4 : 7;
        for (let i = 0; i < orbitCount; i++) {
          const ox = canvasW * (0.2 + i * 0.12);
          const oy = canvasH * (0.18 + (i % 3) * 0.16);
          const r = 60 + i * 22 + Math.sin(scrollDepth * 0.001 + i) * 10;
          ctx.strokeStyle = i % 2 === 0 ? "rgba(0,212,255,.10)" : "rgba(124,58,237,.09)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ox, oy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      } else if (scene === "memory") {
        ctx.save();
        ctx.globalAlpha = 0.55;
        for (let i = 0; i < 6; i++) {
          const y = canvasH * (0.12 + i * 0.14);
          const amp = 18 + i * 4;
          ctx.strokeStyle = i % 2 === 0 ? "rgba(124,58,237,.10)" : "rgba(255,107,53,.08)";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          for (let x = 0; x <= canvasW; x += 12) {
            const yy = y + Math.sin((x * 0.014) + scrollDepth * 0.002 + i) * amp;
            if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
          }
          ctx.stroke();
        }
        ctx.restore();
      } else if (scene === "lattice") {
        ctx.save();
        ctx.globalAlpha = 0.7;
        const cols = isMobile ? 5 : 8;
        for (let i = 0; i < cols; i++) {
          const x = canvasW * ((i + 1) / (cols + 1));
          const height = canvasH * (0.35 + (i % 3) * 0.12);
          const glow = i % 2 === 0 ? "0,255,136" : "0,212,255";
          ctx.strokeStyle = `rgba(${glow},.09)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, canvasH * 0.12);
          ctx.lineTo(x, canvasH * 0.12 + height);
          ctx.stroke();
          ctx.fillStyle = `rgba(${glow},.10)`;
          ctx.fillRect(x - 2, canvasH * 0.12 + height * 0.28, 4, 24);
          ctx.fillRect(x - 2, canvasH * 0.12 + height * 0.62, 4, 12);
        }
        ctx.restore();
      } else if (scene === "burst") {
        ctx.save();
        ctx.globalAlpha = 0.72;
        const cx = canvasW * 0.52;
        const cy = canvasH * 0.54;
        const rays = isMobile ? 16 : 28;
        for (let i = 0; i < rays; i++) {
          const a = (Math.PI * 2 * i) / rays + scrollDepth * 0.0006;
          const len = 140 + Math.sin(scrollDepth * 0.003 + i) * 26 + (i % 3) * 18;
          ctx.strokeStyle = i % 2 === 0 ? "rgba(255,107,53,.12)" : "rgba(0,212,255,.08)";
          ctx.lineWidth = i % 4 === 0 ? 1.6 : 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    drawScene();

    if (mouse.active) {
      const focus = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, mouseRadius);
      focus.addColorStop(0, "rgba(0,212,255,.12)");
      focus.addColorStop(0.35, "rgba(124,58,237,.07)");
      focus.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = focus;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, mouseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = "rgba(0,212,255,.22)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, mouseRadius * 0.46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (mouse.trail.length > 1) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < mouse.trail.length - 1; i++) {
        const a = mouse.trail[i];
        const b = mouse.trail[i + 1];
        const alpha = a.life * (1 - i / mouse.trail.length) * 0.85;
        const width = 18 - i * 1.05;
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, `rgba(0,212,255,${alpha * 0.45})`);
        grad.addColorStop(0.5, `rgba(124,58,237,${alpha * 0.55})`);
        grad.addColorStop(1, `rgba(0,255,136,${alpha * 0.4})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(1, width);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2, b.x, b.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (mouse.active) {
      ctx.save();
      const focus = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, mouseRadius * 0.22);
      focus.addColorStop(0, "rgba(255,255,255,.22)");
      focus.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = focus;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, mouseRadius * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      s.x += s.vx;
      s.y += s.vy + scrollPush * 0.22;

      if (mouse.active) {
        const dx = s.x - mouseX;
        const dy = s.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < mouseRadius) {
          const pull = (1 - dist / mouseRadius) * mouseStrength * 42;
          s.x += (dx / (dist || 1)) * pull;
          s.y += (dy / (dist || 1)) * pull;
        }
      }

      if (s.y - s.len > canvasH + 40 || s.x < -120 || s.x > canvasW + 120) {
        s.x = rand(canvasW * 0.02, canvasW * 0.98);
        s.y = rand(-canvasH * 0.25, -20);
        s.len = rand(100, 280);
        s.width = rand(1, 2.8);
        s.vx = rand(-0.7, 0.7);
        s.vy = rand(2.8, 5.8);
        s.alpha = rand(0.08, 0.24);
        s.hue = Math.random() > 0.5 ? "0,212,255" : Math.random() > 0.5 ? "124,58,237" : "0,255,136";
        s.spin = rand(-10, 10);
      }

      const shardGrad = ctx.createLinearGradient(s.x, s.y, s.x + s.vx * s.len, s.y + s.len);
      shardGrad.addColorStop(0, `rgba(${s.hue},0)`);
      shardGrad.addColorStop(0.2, `rgba(${s.hue},${s.alpha * 0.4})`);
      shardGrad.addColorStop(0.5, `rgba(${s.hue},${s.alpha})`);
      shardGrad.addColorStop(0.8, `rgba(${s.hue},${s.alpha * 0.35})`);
      shardGrad.addColorStop(1, `rgba(${s.hue},0)`);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate((s.spin + scrollVelocity * 0.02) * Math.PI / 180);
      ctx.strokeStyle = shardGrad;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s.vx * s.len, s.len);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < beams.length; i++) {
      const b = beams[i];
      b.y += b.speed + scrollPush * 0.08;
      b.x += Math.sin((scrollDepth + i * 180) * 0.002) * (0.12 + theme.energy * 0.04);
      if (b.y - b.len > canvasH) {
        b.y = rand(-canvasH * 0.2, -20);
        b.x = rand(canvasW * 0.03, canvasW * 0.97);
        b.len = rand(70, 240);
        b.speed = rand(0.7, 2.2);
        b.width = rand(0.6, 1.8);
        b.alpha = rand(0.05, 0.18);
        b.tilt = rand(-0.28, 0.28);
      }

      const grad = ctx.createLinearGradient(b.x, b.y, b.x + b.tilt * b.len, b.y + b.len);
      grad.addColorStop(0, `rgba(${b.hue},0)`);
      grad.addColorStop(0.18, `rgba(${b.hue},${b.alpha * 0.55})`);
      grad.addColorStop(0.5, `rgba(${b.hue},${b.alpha})`);
      grad.addColorStop(0.82, `rgba(${b.hue},${b.alpha * 0.45})`);
      grad.addColorStop(1, `rgba(${b.hue},0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = b.width;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + b.tilt * b.len, b.y + b.len);
      ctx.stroke();
    }

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx + Math.sin((scrollDepth + i * 22) * 0.001) * (0.14 + theme.drift * 0.12);
      p.y += p.vy + scrollPush * 0.02;
      p.pulse += 0.03;

      if (mouse.active) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < mouseRadius) {
          const repel = (1 - dist / mouseRadius) * mouseStrength * 58;
          p.x += (dx / (dist || 1)) * repel;
          p.y += (dy / (dist || 1)) * repel;
        }
      }

      if (p.x < 0) p.x = canvasW;
      if (p.x > canvasW) p.x = 0;
      if (p.y < 0) p.y = canvasH;
      if (p.y > canvasH) p.y = 0;

      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        const max = isMobile ? 150 : 190;
        if (dist < max) {
          const alpha = (1 - dist / max) * (0.34 + theme.energy * 0.08);
          const line = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
          line.addColorStop(0, `rgba(0,212,255,${alpha})`);
          line.addColorStop(0.5, `rgba(124,58,237,${alpha * 0.8})`);
          line.addColorStop(1, `rgba(0,255,136,${alpha})`);
          ctx.strokeStyle = line;
          ctx.lineWidth = dist < 90 ? 1.3 : 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      const glow = 0.45 + Math.sin(p.pulse) * 0.2;
      const color = p.type === "purple" ? "124,58,237" : p.type === "green" ? "0,255,136" : "0,212,255";
      const pulseRadius = p.r * (2.2 + Math.sin(p.pulse * 1.3) * 0.35);
      const spot = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseRadius * 4);
      spot.addColorStop(0, `rgba(${color},${glow})`);
      spot.addColorStop(0.25, `rgba(${color},${glow * 0.32})`);
      spot.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = spot;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseRadius * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = `rgba(${color},0.35)`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseRadius * 2.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = `rgba(${color},0.95)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (mouse.active) {
      ctx.save();
      ctx.globalAlpha = 0.68;
      ctx.strokeStyle = "rgba(0,255,204,.22)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, mouseRadius * 0.82, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(draw);
  };

  resizeCanvas();
  initField();
  syncScroll();
  draw();
  window.addEventListener("scroll", syncScroll, { passive: true });
  window.addEventListener("resize", () => {
    resizeCanvas();
    initField();
    syncScroll();
  });
})();

/* ── 5. PHOTO 3D TILT ─────────────────────────────────────── */
(function photoTilt() {
  /* Aplica tilt 3D a cualquier photo-scene que exista */
  const applyTilt = (sceneId, frameId) => {
    const scene = document.getElementById(sceneId);
    const frame = document.getElementById(frameId);
    if (!scene || !frame) return;
    scene.addEventListener("mousemove", e => {
      const r = scene.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 20;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * -16;
      gsap.to(frame, { rotateY: x, rotateX: y, duration: 0.5, ease: "power2.out", transformPerspective: 900 });
    });
    scene.addEventListener("mouseleave", () => {
      gsap.to(frame, { rotateY: 0, rotateX: 0, duration: 0.9, ease: T.ease });
    });
  };

  applyTilt("hero-photo-scene", "hero-photo-frame");
  applyTilt("photo-scene", "photo-frame");

  /* Floating badges — hero */
  gsap.to("#hero-pb1", { z:20, x:"+=12", y:"+=10", duration:4.8, ease:"sine.inOut", yoyo:true, repeat:-1, delay:0.2 });
  gsap.to("#hero-pb2", { z:30, x:"-=14", y:"-=12", duration:5.6, ease:"sine.inOut", yoyo:true, repeat:-1, delay:0.9 });
  gsap.to("#hero-pb3", { z:25, x:"+=10", y:"+=14", duration:6.2, ease:"sine.inOut", yoyo:true, repeat:-1, delay:1.5 });

  /* Floating badges — historia */
  gsap.to("#pb1", { z:20, x:"+=10", y:"+=8",  duration:5.2, ease:"sine.inOut", yoyo:true, repeat:-1, delay:0.4 });
  gsap.to("#pb2", { z:30, x:"-=12", y:"-=10", duration:6.0, ease:"sine.inOut", yoyo:true, repeat:-1, delay:1.1 });
  gsap.to("#pb3", { z:25, x:"+=8",  y:"+=12", duration:6.6, ease:"sine.inOut", yoyo:true, repeat:-1, delay:1.8 });
})();

/* ── 6. PARALLAX ORBS (mouse) ─────────────────────────────── */
(function parallax() {
  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener("mousemove", e => {
    tx = (e.clientX / window.innerWidth  - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  gsap.ticker.add(() => {
    cx += (tx - cx) * 0.04; cy += (ty - cy) * 0.04;
    gsap.set(".hero__orb--1", { x: cx * window.innerWidth  * 0.03, y: cy * window.innerHeight * 0.03 });
    gsap.set(".hero__orb--2", { x: cx * window.innerWidth  *-0.02, y: cy * window.innerHeight *-0.02 });
  });
})();

/* ── 7. COUNT-UP STATS ────────────────────────────────────── */
(function countUp() {
  document.querySelectorAll(".hstat__n[data-count]").forEach(el => {
    const target = parseInt(el.dataset.count);
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target, duration: 1.8, ease: "power2.out",
          onUpdate: function() { el.textContent = Math.round(this.targets()[0].val); }
        });
      }
    });
  });
})();

/* ── 8. SERVICIOS CARDS ───────────────────────────────────── */
(function servicios() {
  gsap.from("#servicios-header", {
    y: 40, opacity: 0, duration: 0.9, ease: T.ease,
    scrollTrigger: { trigger: "#servicios-header", start: T.scrIn }
  });

  /* Stagger scroll reveal */
  gsap.to(".scard", {
    opacity: 1, y: 0, duration: 0.75, ease: T.ease,
    stagger: { each: 0.12, from: "start" },
    scrollTrigger: { trigger: "#servicios-grid", start: T.scrIn }
  });

  gsap.to("#servicios-cta", {
    opacity: 1, y: 0, duration: 0.8, ease: T.ease,
    scrollTrigger: { trigger: "#servicios-cta", start: T.scrIn }
  });

  /* 3D tilt on hover — desktop only */
  if (window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".scard").forEach(card => {
      const inner = card.querySelector(".scard__3d-inner");
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 16;
        const y = ((e.clientY - r.top)  / r.height - 0.5) *-12;
        gsap.to(inner, { rotateY: x, rotateX: y, z: 12, duration: 0.35, ease: "power2.out", transformPerspective: 900 });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(inner, { rotateY: 0, rotateX: 0, z: 0, duration: 0.7, ease: T.ease });
      });
      /* Scale click pulse */
      card.addEventListener("mousedown",  () => gsap.to(inner, { scale: 0.97, duration: 0.12 }));
      card.addEventListener("mouseup",    () => gsap.to(inner, { scale: 1,    duration: 0.3, ease: "back.out(2)" }));
    });
  }
})();

/* ── 9. PROYECTOS CARDS ───────────────────────────────────── */
(function proyectos() {
  gsap.from("#proyectos-header", {
    y: 40, opacity: 0, duration: 0.9, ease: T.ease,
    scrollTrigger: { trigger: "#proyectos-header", start: T.scrIn }
  });

  gsap.to(".pcard", {
    opacity: 1, y: 0, duration: 0.7, ease: T.ease,
    stagger: { each: 0.1, from: "start" },
    scrollTrigger: { trigger: "#proyectos-grid", start: T.scrIn }
  });

  if (window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".pcard").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 14;
        const y = ((e.clientY - r.top)  / r.height - 0.5) *-10;
        gsap.to(card, { rotateY: x, rotateX: y, duration: 0.4, ease: "power2.out", transformPerspective: 800 });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: T.ease });
      });
    });
  }
})();

/* ── 10. HISTORIA ─────────────────────────────────────────── */
(function historia() {
  gsap.from("#historia-header", {
    y: 40, opacity: 0, duration: 0.9, ease: T.ease,
    scrollTrigger: { trigger: "#historia-header", start: T.scrIn }
  });
  gsap.to(".historia__p", {
    opacity: 1, y: 0, duration: 0.85, ease: T.ease2, stagger: 0.14,
    scrollTrigger: { trigger: "#historia-text", start: T.scrIn }
  });

  /* Foto en historia — scroll reveal */
  gsap.to("#photo-frame", {
    opacity: 1, x: 0, rotateY: 0, duration: 1.2, ease: T.ease,
    scrollTrigger: { trigger: "#historia-visual", start: T.scrIn }
  });
  gsap.to(["#pb1","#pb2","#pb3"], {
    opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: "back.out(1.4)",
    scrollTrigger: { trigger: "#historia-visual", start: T.scrIn }
  });

  gsap.to(".bridge-card", {
    opacity: 1, x: 0, duration: 1.1, ease: T.ease,
    scrollTrigger: { trigger: ".bridge-card", start: T.scrIn }
  });
  gsap.from(".bridge-card__line", {
    scaleX: 0, transformOrigin: "left", duration: 1.4, ease: T.ease,
    scrollTrigger: { trigger: ".bridge-card", start: T.scrIn }
  });
})();

/* ── 11. STACK GRID ───────────────────────────────────────── */
(function stack() {
  gsap.from("#stack-header", {
    y: 40, opacity: 0, duration: 0.9, ease: T.ease,
    scrollTrigger: { trigger: "#stack-header", start: T.scrIn }
  });
  gsap.to(".stool", {
    opacity: 1, y: 0, duration: 0.6, ease: T.ease,
    stagger: { each: 0.055, from: "start" },
    scrollTrigger: { trigger: "#stack-grid", start: T.scrIn }
  });
})();

/* ── 12. CONTACTO ─────────────────────────────────────────── */
(function contacto() {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: "#contacto-inner", start: T.scrIn }
  });
  tl.to("#contacto-label",    { opacity:1, y:0, duration:0.6, ease:T.ease },  0 )
    .to("#contacto-title",    { opacity:1, y:0, duration:1.0, ease:T.ease }, .15)
    .to("#contacto-sub",      { opacity:1, y:0, duration:0.9, ease:T.ease2},.3 )
    .to("#contacto-channels", { opacity:1, y:0, duration:0.8, ease:T.ease }, .45)
    .to("#contacto-location", { opacity:1, y:0, duration:0.7, ease:T.ease }, .6 )
    .from(".channel-btn", { y:20, opacity:0, duration:0.5, stagger:0.1, ease:T.ease }, .5);
})();

/* ── 13. BREATHING LOOPS ──────────────────────────────────── */
(function loops() {
  /* Hero orbs float */
  gsap.to(".hero__orb--1", { y:"+=28", x:"+=14", duration:7.5, ease:"sine.inOut", yoyo:true, repeat:-1 });
  gsap.to(".hero__orb--2", { y:"-=22", x:"+=18", duration:9.2, ease:"sine.inOut", yoyo:true, repeat:-1, delay:1.5 });

  /* Contacto orbs breathe */
  gsap.to(".contacto__orb--1", { scale:1.18, duration:8,   ease:"sine.inOut", yoyo:true, repeat:-1 });
  gsap.to(".contacto__orb--2", { scale:0.82, duration:10,  ease:"sine.inOut", yoyo:true, repeat:-1, delay:2 });

  /* WA float pulse shadow */
  gsap.to(".wa-float", {
    boxShadow:"0 8px 50px rgba(37,211,102,.55)",
    duration:1.8, ease:"sine.inOut", yoyo:true, repeat:-1, delay:2
  });

  /* Photo frame glow pulse */
  gsap.to(".photo-frame", {
    filter:"drop-shadow(0 0 30px rgba(0,212,255,.18))",
    duration:4, ease:"sine.inOut", yoyo:true, repeat:-1, delay:1
  });

  /* Nav cta pulse */
  gsap.to(".nav__cta", {
    boxShadow:"0 0 20px rgba(0,212,255,.35)",
    duration:2.2, ease:"sine.inOut", yoyo:true, repeat:-1, delay:2
  });
})();

/* ── 14. SCROLL PROGRESS ──────────────────────────────────── */
(function progress() {
  const bar = document.getElementById("scroll-progress");
  ScrollTrigger.create({
    start:0, end:"max",
    onUpdate: self => { if(bar) bar.style.width = (self.progress * 100) + "%"; }
  });
  gsap.from(".footer", {
    opacity:0, y:20, duration:0.8, ease:T.ease2,
    scrollTrigger:{ trigger:".footer", start:"top 95%" }
  });
})();

/* ── 15. WHATSAPP FLOAT ───────────────────────────────────── */
(function waButton() {
  const wa = document.getElementById("wa-float");
  if (!wa) return;
  /* Show after 3s */
  gsap.to(wa, {
    y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.5)", delay: 3
  });
  /* Hide on hero, show on scroll past */
  ScrollTrigger.create({
    trigger: "#servicios",
    start: "top 80%",
    onEnter:     () => gsap.to(wa, { y:0, opacity:1, duration:.5, ease:T.ease }),
    onLeaveBack: () => gsap.to(wa, { y:80, opacity:0, duration:.4 }),
  });
})();

/* ── 17. FLOATING ACTION BUBBLES ─────────────────────────── */
(function floatCTAs() {
  const ctas = Array.from(document.querySelectorAll('.float-cta'));
  if (!ctas.length) return;

  gsap.set(ctas, { x: '120%', opacity: 0 });

  let currentGroup = 0;
  const groupSize = 3;
  const totalGroups = Math.ceil(ctas.length / groupSize);

  const showGroup = group => {
    const start = group * groupSize;
    ctas.forEach((cta, i) => {
      if (i >= start && i < start + groupSize) {
        gsap.to(cta, {
          x: 0, opacity: 1, duration: 0.65,
          delay: (i - start) * 0.12, ease: 'back.out(1.3)'
        });
      } else {
        gsap.to(cta, { x: '120%', opacity: 0, duration: 0.35, ease: 'power2.in' });
      }
    });
  };

  ScrollTrigger.create({
    trigger: '#servicios',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      showGroup(0);
      setInterval(() => {
        currentGroup = (currentGroup + 1) % totalGroups;
        showGroup(currentGroup);
      }, 9000);
    }
  });

  ctas.forEach((cta, i) => {
    gsap.to(cta, {
      y: (i % 2 === 0 ? '-' : '+') + '=' + (6 + (i % 3) * 3),
      duration: 2.8 + i * 0.28,
      ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.22
    });
    cta.addEventListener('mouseenter', () =>
      gsap.to(cta, { x: -10, duration: 0.2, ease: 'power2.out' })
    );
    cta.addEventListener('mouseleave', () =>
      gsap.to(cta, { x: 0, duration: 0.3, ease: 'power2.out' })
    );
  });
})();

/* ── MICRO: button active press ───────────────────────────── */
document.querySelectorAll(".btn--primary, .btn--wa, .channel-btn--primary").forEach(btn => {
  btn.addEventListener("mousedown",  () => gsap.to(btn, { scale: 0.96, duration: 0.1 }));
  btn.addEventListener("mouseup",    () => gsap.to(btn, { scale: 1, duration: 0.4, ease: "back.out(2)" }));
  btn.addEventListener("mouseleave", () => gsap.to(btn, { scale: 1, duration: 0.3 }));
});


const video = document.getElementById('hero-video');
const videoSource = document.getElementById('hero-video-source');
const unmuteBtn = document.getElementById('unmute-btn');

if (video && unmuteBtn) {
  const playlist = [
    "video/hero-2.mp4",
    "video/hero-1.mp4",
  ];
  let playlistIndex = 0;

  const loadPlaylistItem = (index, shouldPlay = false) => {
    const nextSrc = playlist[index];
    if (!nextSrc) return;

    // Solo cargamos si el src es diferente al actual para evitar parpadeos
    const currentSrc = video.currentSrc || "";
    if (!currentSrc.includes(nextSrc)) {
      if (videoSource) videoSource.src = nextSrc;
      else video.src = nextSrc;
      video.load();
    }

    if (shouldPlay) {
      // Si el video ya está listo, play inmediato. Si no, esperamos al evento.
      if (video.readyState >= 3) {
        video.play().catch(e => console.warn("Error play:", e));
      } else {
        video.addEventListener('canplay', () => {
          video.play().catch(e => console.warn("Error play on canplay:", e));
        }, { once: true });
      }
    }
  };

  const syncAudioButton = () => {
    unmuteBtn.textContent = video.muted ? "ACTIVAR AUDIO" : "SILENCIAR";
    unmuteBtn.setAttribute("aria-pressed", String(!video.muted));
  };

  // Forzar mute y tratar de reproducir de inmediato
  video.muted = true;
  const startVideo = () => {
    video.play().catch(() => {
      // Si falla el autoplay, intentamos cargar el primer item de la playlist
      loadPlaylistItem(playlistIndex, true);
    });
  };

  startVideo();
  syncAudioButton();

  video.addEventListener("ended", () => {
    playlistIndex = (playlistIndex + 1) % playlist.length;
    loadPlaylistItem(playlistIndex, true);
  });

  unmuteBtn.addEventListener('click', async () => {
    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        console.warn("No se pudo reproducir el video:", error);
        return;
      }
    }

    video.muted = !video.muted;
    syncAudioButton();
  });
}

/* ── 16. GABY VOICE ASSISTANT ─────────────────────────────── */
(function gabyAssistant() {
  const widget = document.getElementById("gaby-widget");
  const launcher = document.getElementById("gaby-launcher");
  const panel = document.getElementById("gaby-panel");
  const closeBtn = document.getElementById("gaby-close");
  const messages = document.getElementById("gaby-messages");
  const form = document.getElementById("gaby-form");
  const input = document.getElementById("gaby-input");
  const mic = document.getElementById("gaby-mic");
  const status = document.getElementById("gaby-status");
  const chips = document.querySelectorAll("#gaby-chips .gaby-chip");

  if (!widget || !launcher || !panel || !messages || !form || !input || !mic || !status) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  const synth = window.speechSynthesis;
  const state = {
    open: false,
    greeted: false,
    listening: false,
    speaking: false,
    voiceMode: false,
    voices: [],
  };
  const conversation = [];
  const voiceState = {
    pendingTranscript: "",
    pendingTimer: null,
    handledTranscript: "",
    pendingReply: "",
  };

  const normalize = text => text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  const nowStamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMessage = (text, role = "gaby") => {
    const bubble = document.createElement("div");
    bubble.className = `gaby-msg gaby-msg--${role}`;
    const content = document.createElement("span");
    content.textContent = text;
    const meta = document.createElement("span");
    meta.className = "gaby-msg__meta";
    meta.textContent = `${role === "gaby" ? "Gaby" : "Tú"} · ${nowStamp()}`;
    bubble.appendChild(content);
    bubble.appendChild(meta);
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    conversation.push({ role, content: text });
    if (conversation.length > 16) conversation.shift();
    return bubble;
  };

  const setStatus = text => {
    status.textContent = text;
  };

  const preferredVoices = [
    "Microsoft Helena",
    "Microsoft Sabina",
    "Microsoft Alana",
    "Microsoft Monica",
    "Microsoft Paulina",
    "Luciana",
    "Monica",
    "Paulina",
    "Carla",
    "Samantha",
    "Victoria",
    "Google espa?ol",
    "Google espa?ol de Estados Unidos",
  ];

  const femaleHints = [
    "helena",
    "sabina",
    "alana",
    "monica",
    "paulina",
    "luciana",
    "carla",
    "samantha",
    "victoria",
    "maria",
    "isabela",
    "isabella",
    "elaine",
    "zira",
    "hazel",
    "tessa",
    "nuria",
    "lucia",
    "sofia",
    "sophia",
  ];

  const pickVoice = () => {
    if (!state.voices.length) return null;
    for (const name of preferredVoices) {
      const voice = state.voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
      if (voice) return voice;
    }
    const spanishFemale = state.voices.find(v => {
      const name = (v.name || "").toLowerCase();
      const lang = (v.lang || "").toLowerCase();
      return lang.startsWith("es") && femaleHints.some(hint => name.includes(hint));
    });
    if (spanishFemale) return spanishFemale;
    const spanishVoice = state.voices.find(v => v.lang && v.lang.toLowerCase().startsWith("es"));
    if (spanishVoice) return spanishVoice;
    return state.voices[0];
  };

  const refreshVoices = () => {
    state.voices = synth ? synth.getVoices() : [];
  };

  refreshVoices();
  if (synth) {
    synth.onvoiceschanged = refreshVoices;
  }

  const speak = text => {
    if (!synth) return;
    synth.cancel();
    if (typeof synth.resume === "function") synth.resume();
    window.setTimeout(() => {
      refreshVoices();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = (voice && voice.lang) || "es-ES";
      utterance.rate = 0.92;
      utterance.pitch = 1.28;
      utterance.volume = 1;
      state.speaking = true;
      utterance.onstart = () => {
        setStatus("hablando...");
      };
      utterance.onend = () => {
        state.speaking = false;
        if (!state.listening) setStatus("en línea · voz activada");
        if (state.voiceMode && recognition && !state.listening && state.open) {
          setTimeout(() => {
            try { recognition.start(); } catch (e) {}
          }, 500);
        }
      };
      utterance.onerror = event => {
        console.warn("Gaby voice synthesis error:", event.error || event);
        state.speaking = false;
        if (!state.listening) setStatus("en línea · voz activada");
      };
      synth.speak(utterance);
    }, 60);
  };

  const salesCatalog = [
    {
      id: "landing",
      title: "Landing pages premium",
      keys: ["landing", "landing page", "pagina web", "pagina", "web", "sitio web", "sitio", "pagina de aterrizaje"],
      summary: "Diseño y desarrollo de landings con animación, enfoque en conversión y estética de marca.",
      outcomes: ["más mensajes y leads", "marca más premium", "CTA claros para vender mejor"],
      deliverables: ["estructura de conversión", "copy base", "animaciones visuales", "CTA y seguimiento"],
      priceGuidance: "La inversión depende del número de secciones, animaciones e integraciones.",
      fit: "ideal si vendes servicios, lanzas un producto o quieres una web que convierta en lugar de solo verse bonita",
      close: "si quieres, te digo qué secciones necesita tu landing para cerrar más clientes",
    },
    {
      id: "bots",
      title: "Bots de WhatsApp",
      keys: ["bot", "bots", "whatsapp bot", "bot de whatsapp", "chatbot", "asistente", "responder mensajes"],
      summary: "Bots que atienden clientes, califican leads y responden preguntas frecuentes 24/7.",
      outcomes: ["respuestas automáticas", "captura de leads", "menos tiempo perdido en mensajes"],
      deliverables: ["flujo de conversación", "preguntas de calificación", "handoff humano", "mensajes de cierre"],
      priceGuidance: "La inversión depende de cuántos flujos, integraciones y reglas de negocio necesite.",
      fit: "ideal si recibes muchas preguntas repetidas y quieres vender sin estar pegado al celular",
      close: "si quieres, te diseño el flujo ideal para captar y cerrar clientes por WhatsApp",
    },
    {
      id: "automation",
      title: "Automatizaciones con IA",
      keys: ["automatizacion", "automatizaciones", "automatizar", "flujo", "n8n", "workflows", "integracion", "integraciones"],
      summary: "Flujos que conectan formularios, WhatsApp, email, CRM, contenido y seguimiento automático.",
      outcomes: ["menos tareas manuales", "seguimiento más rápido", "ventas más ordenadas"],
      deliverables: ["mapa de procesos", "nodos n8n", "integraciones", "alertas y seguimiento"],
      priceGuidance: "La inversión cambia según el número de pasos, fuentes de datos y sistemas conectados.",
      fit: "ideal si quieres que tu negocio funcione como sistema y no como caos",
      close: "si me dices tu proceso actual, te propongo qué automatizar primero para ganar tiempo y ventas",
    },
    {
      id: "branding",
      title: "Branding y presencia digital",
      keys: ["branding", "marca", "identidad", "logo", "brand", "branding digital", "presencia digital"],
      summary: "Identidad visual, tono, estructura de contenido y presencia premium para que te tomen en serio.",
      outcomes: ["más confianza", "mejor percepción de valor", "coherencia visual"],
      deliverables: ["logo y símbolos", "paleta y tipografías", "tono de marca", "base de contenido"],
      priceGuidance: "La inversión depende de si necesitas solo identidad base o un sistema de marca completo.",
      fit: "ideal si tu negocio ya vende pero todavía no se ve como marca fuerte",
      close: "si quieres, te digo qué piezas de marca te faltan para subir de nivel",
    },
    {
      id: "ai",
      title: "Sistemas e IA personalizados",
      keys: ["ia", "inteligencia artificial", "agente", "agentes", "llama", "claude", "sistema de ia", "copiloto"],
      summary: "Agentes y sistemas de IA conectados a tu operación para responder, analizar o generar contenido.",
      outcomes: ["más velocidad operativa", "respuesta inteligente", "mejor aprovechamiento de datos"],
      deliverables: ["prompt system", "base de conocimiento", "integraciones", "asistente de ventas"],
      priceGuidance: "La inversión depende del nivel de personalización, datos y automatizaciones que necesites.",
      fit: "ideal si quieres que parte del negocio piense y actúe contigo",
      close: "si quieres, te digo qué agente de IA te conviene según tu negocio",
    },
  ];

  const objectionBank = [
    {
      keys: ["caro", "muy caro", "precio alto", "costoso", "costosa", "fuera de presupuesto"],
      reply: "Si el presupuesto está apretado, podemos bajar el alcance y empezar con una versión más pequeña. Lo importante es construir algo que ya te genere retorno.",
    },
    {
      keys: ["tiempo", "urgente", "rapido", "ya", "hoy", "esta semana"],
      reply: "Si lo necesitas rápido, te recomiendo priorizar la parte que más vende primero. Así lanzamos una base sólida y luego ampliamos el sistema.",
    },
    {
      keys: ["confianza", "seguro", "garantia", "seguridad", "dudas", "riesgo"],
      reply: "Entiendo la duda. Lo mejor es arrancar con un alcance claro, hitos cortos y comunicación directa para que veas avance real desde el inicio.",
    },
    {
      keys: ["no se", "no tengo idea", "ayuda", "recomienda", "recomiendame"],
      reply: "Perfecto. Yo te puedo orientar: dime qué vendes, cómo te llegan clientes hoy y qué quieres mejorar, y te digo por dónde empezar.",
    },
  ];

  const leadState = {
    service: null,
    goal: null,
    budget: null,
    timeline: null,
    name: null,
    contact: null,
    source: "website",
  };
  const leadCaptureState = {
    sent: false,
  };

  const findService = text => salesCatalog.find(service => service.keys.some(key => text.includes(key)));

  const isSalesIntent = text => [
    "cotizar",
    "presupuesto",
    "precio",
    "precios",
    "contratar",
    "contrato",
    "comprar",
    "agenda",
    "cerrar",
    "leads",
    "ventas",
    "whatsapp",
    "contacto",
  ].some(word => text.includes(word));

  const getLeadSnapshot = () => ({
    service: leadState.service,
    goal: leadState.goal,
    budget: leadState.budget,
    timeline: leadState.timeline,
    name: leadState.name,
    contact: leadState.contact,
    source: leadState.source,
  });

  const captureLeadSignals = text => {
    const service = findService(text);
    if (service) leadState.service = service.title;

    const timelineMatch = text.match(/(\d+\s?(?:dias|días|semanas|meses))/i);
    if (timelineMatch) leadState.timeline = timelineMatch[1];

    const moneyMatch = text.match(/(?:usd|dolares?|rd\$|\$)\s?(\d+(?:[.,]\d{1,2})?)/i);
    if (moneyMatch) leadState.budget = moneyMatch[0].replace(/\s+/g, " ");

    const emailMatch = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    if (emailMatch) leadState.contact = emailMatch[0];

    const phoneMatch = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
    if (phoneMatch && !leadState.contact) leadState.contact = phoneMatch[0].replace(/\s+/g, " ").trim();

    const nameMatch = text.match(/(?:me llamo|soy)\s+([a-záéíóúüñ][a-záéíóúüñ' -]{1,30})/i);
    if (nameMatch) leadState.name = nameMatch[1].trim();

    if (text.includes("vender") || text.includes("ventas") || text.includes("lead") || text.includes("leads")) {
      leadState.goal = "generar más ventas y leads";
    } else if (text.includes("ahorrar tiempo") || text.includes("tiempo") || text.includes("automat")) {
      leadState.goal = "ahorrar tiempo y automatizar procesos";
    } else if (text.includes("marca") || text.includes("branding") || text.includes("presencia")) {
      leadState.goal = "mejorar la marca y la presencia digital";
    }
  };

  const leadIsQualified = () => {
    const fields = [leadState.service, leadState.goal, leadState.timeline, leadState.budget].filter(Boolean);
    return fields.length >= 3;
  };

  const maybeSendLeadCapture = async (text, reply) => {
    if (leadCaptureState.sent) return;
    if (!isSalesIntent(text) && !leadIsQualified()) return;

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          reply,
          conversation: conversation.slice(-12),
          leadState: getLeadSnapshot(),
          source: "gaby-widget",
          page: window.location.pathname,
        }),
      });
      if (response.ok) {
        leadCaptureState.sent = true;
      }
    } catch (error) {
      console.warn("Lead capture error:", error);
    }
  };

  const formatServiceReply = service => {
    const bullets = service.outcomes.map(item => `• ${item}`).join(" ");
    const deliverables = Array.isArray(service.deliverables) && service.deliverables.length
      ? `Entregables típicos: ${service.deliverables.join(", ")}. `
      : "";
    const priceGuidance = service.priceGuidance
      ? `${service.priceGuidance} `
      : "La inversión depende del alcance, funciones y urgencia. ";
    const followUp = service.id === "landing"
      ? "¿Tu landing vendería servicios, reservas o captación de leads?"
      : service.id === "bots"
        ? "¿El bot debe responder preguntas, calificar clientes o vender por WhatsApp?"
        : service.id === "automation"
          ? "¿Qué proceso quieres quitarte de encima primero?"
        : service.id === "branding"
            ? "¿Tu marca necesita más autoridad, más confianza o más conversión?"
            : "¿Qué parte de tu operación quieres que piense o trabaje por ti?";

    return `${service.summary} ${bullets}. ${deliverables}${priceGuidance}${service.fit}. ${service.close}. ${followUp}`;
  };

  const formatCatalogReply = () => {
    const lines = salesCatalog
      .map(service => `• ${service.title}: ${service.summary}`)
      .join(" ");
    return `${lines} Si me dices tu negocio, tu objetivo y si quieres vender más o ahorrar tiempo, te digo cuál te conviene y cómo lo cerraríamos.`;
  };

  const formatQuoteReply = () => {
    const parts = [];
    if (leadState.service) parts.push(`servicio: ${leadState.service}`);
    if (leadState.goal) parts.push(`objetivo: ${leadState.goal}`);
    if (leadState.timeline) parts.push(`tiempo: ${leadState.timeline}`);
    if (leadState.budget) parts.push(`presupuesto: ${leadState.budget}`);
    if (leadState.name) parts.push(`nombre: ${leadState.name}`);
    if (leadState.contact) parts.push(`contacto: ${leadState.contact}`);

    const profile = parts.length ? parts.join(" · ") : "todavía no tengo suficientes datos";
    return `Para cotizar bien necesito 3 datos: qué quieres construir, en cuánto tiempo lo quieres y qué resultado esperas. ${profile}. Si quieres, escríbeme esas 3 cosas y te doy una ruta clara para avanzar y cerrar por WhatsApp.`;
  };

  // ============================================================
  // NUEVA FUNCIÓN getReply COMPLETAMENTE RENOVADA Y AMPLIADA
  // ============================================================
  const getReply = (rawText) => {
    const text = normalize(rawText);
    captureLeadSignals(text);

    // --- SALUDOS Y APERTURAS (más variados) ---
    if (text.match(/^(hola|buenas|hey|hello|saludos|qué tal|qué hubo|buen día|buenas tardes|buenas noches)/i)) {
      const saludos = [
        "¡Hola! Soy Gaby, tu asistente de TR0Y STUDIO. ¿En qué puedo ayudarte hoy?",
        "¡Hey! ¿Cómo estás? Cuéntame, ¿qué necesitas saber sobre nuestros servicios?",
        "¡Buenas! ¿Listo para llevar tu negocio al siguiente nivel? Dime qué buscas.",
        "¡Saludos! Estoy aquí para resolver todas tus dudas sobre landings, bots, automatizaciones y más."
      ];
      return saludos[Math.floor(Math.random() * saludos.length)];
    }

    // --- QUIÉN SOY / PRESENTACIÓN ---
    if (text.match(/quién eres|qué eres|quién es gaby|presentate|cuéntame de ti/i)) {
      const presentaciones = [
        "Soy Gaby, la asistente de voz de TR0Y STUDIO. Mi misión es explicarte los servicios, ayudarte a elegir la mejor solución y guiarte hasta el cierre con una propuesta clara.",
        "Soy Gaby. Puedo responder sobre landings premium, bots de WhatsApp, automatizaciones con IA, branding y sistemas personalizados. También te ayudo a definir qué necesita tu negocio.",
        "Encantada, soy Gaby. Trabajo para TR0Y STUDIO y estoy aquí para que entiendas cada servicio, resuelvas tus dudas y avances rápido hacia lo que necesitas."
      ];
      return presentaciones[Math.floor(Math.random() * presentaciones.length)];
    }

    // --- PRECIOS Y COTIZACIONES (más detallado) ---
    if (text.match(/precio|costo|coste|cuánto cuesta|cuánto vale|inversión|cuánto sale|presupuesto/i)) {
      return formatQuoteReply();
    }

    // --- CONTACTO (más opciones) ---
    if (text.match(/contacto|contactar|whatsapp|email|correo|instagram|linkedin|cómo te contacto/i)) {
      const contactos = [
        "La forma más rápida es por WhatsApp. ¿Quieres que te prepare el mensaje ideal para que me escribas con tu negocio, objetivo y plazo?",
        "Puedes contactarnos directamente por WhatsApp o escribirnos a través del formulario en la sección de contacto. ¿Necesitas algún dato específico?",
        "Lo mejor es cerrar por WhatsApp, así avanzamos más rápido. Dime qué servicio te interesa y te paso el enlace directo."
      ];
      return contactos[Math.floor(Math.random() * contactos.length)];
    }

    // --- UBICACIÓN (con variaciones) ---
    if (text.match(/ubicación|dónde estás|dónde te encuentro|punta cana|república dominicana|rd|trabajas remoto|desde dónde operas/i)) {
      const ubicaciones = [
        "Operamos desde Punta Cana, República Dominicana, aunque trabajamos remoto para clientes de cualquier país. ¿Tú de dónde eres?",
        "Estamos en Punta Cana, pero atendemos proyectos de cualquier parte del mundo. La distancia no es problema para construir algo increíble juntos.",
        "Nuestra base está en República Dominicana, pero la mayoría de nuestros clientes trabajan con nosotros 100% remoto sin ningún inconveniente."
      ];
      return ubicaciones[Math.floor(Math.random() * ubicaciones.length)];
    }

    // --- PROYECTOS / PORTAFOLIO ---
    if (text.match(/proyecto|proyectos|portafolio|casos de éxito|qué has hecho|qué han hecho|ejemplos/i)) {
      const proyectos = [
        "Actualmente estamos trabajando en Multizona, El Arepero, VenturesPC, y por supuesto TR0Y STUDIO. Cada proyecto con su propio stack y enfoque. ¿Te interesa alguno en particular?",
        "Nuestro portafolio incluye sistemas en producción, landings de alta conversión y bots que ya están generando leads. ¿Qué tipo de proyecto estás buscando?",
        "Tenemos desde landings para startups hasta automatizaciones completas con IA. Si me cuentas tu industria, puedo compartirte ejemplos más cercanos a lo que necesitas."
      ];
      return proyectos[Math.floor(Math.random() * proyectos.length)];
    }

    // --- TECNOLOGÍA Y STACK ---
    if (text.match(/stack|tecnología|tecnologías|herramienta|herramientas|con qué trabajas|qué usas|tecnologías que manejas/i)) {
      const stacks = [
        "Trabajamos con n8n, Claude API, Llama, Three.js, IPFS, CoreDAO, WhatsApp API, Meta Graph API, GSAP y más. ¿Hay alguna tecnología específica que te interese?",
        "Nuestro stack es moderno y flexible: usamos lo mejor para cada necesidad, desde automatización low-code hasta integraciones avanzadas con IA. Dime qué necesitas conectar.",
        "En automatización usamos n8n, en interfaces GSAP y Three.js, en IA preferimos Claude y Llama. ¿Tienes alguna preferencia técnica?"
      ];
      return stacks[Math.floor(Math.random() * stacks.length)];
    }

    // --- TIEMPOS DE ENTREGA (variado) ---
    if (text.match(/tiempo|entrega|plazo|cuándo|cuánto tarda|lo necesito rápido|fecha límite/i)) {
      const tiempos = [
        "Depende del alcance, pero una landing premium puede estar lista en 7 a 14 días si el brief está claro. Para bots o automatizaciones evaluamos la complejidad primero.",
        "El plazo se define según lo que necesites. Lo que sí te aseguro es que trabajamos con hitos claros y comunicación constante para que nada se retrase.",
        "Si tu proyecto es urgente, priorizamos la parte que más te va a generar resultados para lanzar rápido y después escalar. ¿Cuál es tu fecha ideal?"
      ];
      return tiempos[Math.floor(Math.random() * tiempos.length)];
    }

    // --- CERRAR / CONTRATAR (más dinámico) ---
    if (text.match(/cerrar|contratar|comprar|quiero avanzar|empezar ya|estoy listo|vamos a trabajar/i)) {
      const cerrar = [
        "Me encanta tu energía. Para cerrar rápido, dime qué servicio quieres, cuál es tu objetivo principal y en qué plazo lo necesitas. Con eso te doy una propuesta clara y el siguiente paso.",
        "Perfecto, hablemos de números. Cuéntame qué esperas lograr, cuánto tiempo le quieres dedicar y listo. Te armo una cotización clara.",
        "Me alegra que quieras avanzar. Lo primero es definir si necesitas una landing, un bot, automatización o branding. Una vez claro, coordino tu llamada con el equipo."
      ];
      return cerrar[Math.floor(Math.random() * cerrar.length)];
    }

    // --- OBJECIONES (mejoradas) ---
    for (const obj of objectionBank) {
      if (obj.keys.some(key => text.includes(key))) {
        return obj.reply;
      }
    }

    // --- SERVICIOS (match más flexible) ---
    const service = findService(text);
    if (service) {
      return formatServiceReply(service);
    }

    // --- CATÁLOGO GENERAL DE SERVICIOS ---
    if (text.match(/servicio|servicios|qué haces|qué ofreces|qué hacen|qué servicios tienen|ofreces|en qué me ayudas/i)) {
      return formatCatalogReply();
    }

    // --- LANDINGS (match directo) ---
    if (text.match(/landing|página web|web|sitio|página de aterrizaje|página de ventas/i)) {
      return formatServiceReply(salesCatalog[0]);
    }

    // --- BOTS de WhatsApp ---
    if (text.match(/bot|bots|whatsapp|whatsapp bot|chatbot|asistente|responder mensajes automáticos/i)) {
      return formatServiceReply(salesCatalog[1]);
    }

    // --- AUTOMATIZACIONES ---
    if (text.match(/automatización|automatizar|flujo|workflow|n8n|procesos automáticos|integración de sistemas|conectar herramientas/i)) {
      return formatServiceReply(salesCatalog[2]);
    }

    // --- BRANDING ---
    if (text.match(/marca|branding|identidad|logo|brand|imagen de marca|hacer crecer mi marca|posicionamiento/i)) {
      return formatServiceReply(salesCatalog[3]);
    }

    // --- IA / AGENTES ---
    if (text.match(/ia|inteligencia artificial|agente|agentes|sistema con ia|copiloto|asistente inteligente|entrenar una ia/i)) {
      return formatServiceReply(salesCatalog[4]);
    }

    // --- RESPUESTA PARA AFIRMACIONES CORTAS (ok, claro, sí) ---
    if (text.match(/^(ok|oka|claro|sí|si|vale|de acuerdo|entiendo|perfecto|bien|excelente)$/i)) {
      const afirmaciones = [
        "Perfecto. Entonces dime qué quieres vender, qué problema quieres resolver y en cuánto tiempo. Con eso te planteo el mejor camino.",
        "Genial. Ahora cuéntame un poco más sobre tu negocio o proyecto para que pueda orientarte mejor.",
        "Me alegra que estemos en la misma sintonía. ¿Qué es lo primero que te gustaría resolver con nosotros?"
      ];
      return afirmaciones[Math.floor(Math.random() * afirmaciones.length)];
    }

    // --- PREGUNTAS ABIERTAS / AYUDA (match más amplio) ---
    if (text.match(/cómo|cómo funciona|qué me recomiendas|ayúdame|explica|detalla|analiza|mejor opción|estrategia|embudo|ventas|seguimiento|cerrar más|objetivo|quiero vender|no sé por dónde empezar|qué harías|por dónde empiezo|dónde empiezo/i)) {
      const ayudas = [
        "Me encanta que quieras claridad. Lo primero es identificar qué tipo de proyecto necesitas: ¿atraer clientes (landing), automatizar respuestas (bot) o conectar todo tu sistema (automatización con IA)?",
        "Si no sabes por dónde empezar, te recomiendo empezar con un diagnóstico rápido. Dime cómo captas clientes hoy y qué te gustaría mejorar, y yo te digo qué servicio te da más retorno.",
        "Podemos construir por partes. Primero definimos el objetivo principal (más leads, menos tareas manuales o mejor marca) y desde ahí armamos el plan. ¿Qué te suena más urgente?"
      ];
      return ayudas[Math.floor(Math.random() * ayudas.length)];
    }

    // --- DESPEDIDAS (si se va) ---
    if (text.match(/adiós|chao|nos vemos|hasta luego|gracias por todo|bye|hasta pronto|me voy|terminamos/i)) {
      const despedidas = [
        "Gracias por conversar conmigo. Cuando quieras retomar, aquí estoy. ¡Que tengas un excelente día!",
        "Fue un placer ayudarte. Si te surge alguna otra pregunta, ya sabes dónde encontrarme. ¡Éxito con tu proyecto!",
        "Cuídate mucho. Cuando decidas avanzar, solo escríbeme y retomamos donde lo dejamos. ¿Vale?"
      ];
      return despedidas[Math.floor(Math.random() * despedidas.length)];
    }

    // --- RESPUESTA POR DEFECTO (más amable y orientadora) ---
    const fallbacks = [
      "Entiendo tu pregunta, pero para darte la mejor respuesta, cuéntame un poco más: ¿estás buscando una landing, un bot de WhatsApp, automatizaciones, branding o IA personalizada?",
      "Me interesa ayudarte. Dime si tu proyecto tiene que ver con ventas, automatización, presencia digital o todo junto. Así puedo ser más precisa.",
      "No entendí del todo tu consulta. ¿Podrías contarme con otras palabras qué necesitas? Puedo ayudarte con landings, bots, automatizaciones, branding y sistemas con IA."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const shouldUseClaude = (text, localReply) => {
    if (!localReply) return true;
    if (localReply.startsWith("Puedo responder sobre landings")) return true;
    const quickSignals = [
      "hola", "buenas", "hey", "hello", "saludos", "quien eres", "que eres", "quien es gaby", "presentate",
      "precio", "precios", "costo", "coste", "cuanto", "cotizacion", "contacto", "contactar", "whatsapp",
      "ubicacion", "donde", "donde estas", "punta cana", "rd", "republica dominicana", "tiempo", "entrega",
      "plazo", "rapido", "servicio", "servicios", "que haces", "que ofreces", "ofreces", "landing", "bot",
      "automat", "branding", "identidad", "ia", "agente", "inteligencia artificial",
    ];
    if (quickSignals.some(signal => text.includes(signal))) return false;
    const openEndedSignals = [
      "como", "cómo", "que me recomiendas", "qué me recomiendas", "recomiendas", "ayudame", "ayúdame",
      "explica", "detalla", "analiza", "revisa", "mejor opcion", "mejor opción", "conviene", "estrategia",
      "propuesta", "embudo", "ventas", "seguimiento", "cerrar mas", "cerrar más", "objetivo", "quiero vender",
      "no se por donde empezar", "no sé por donde empezar", "que harías", "qué harías",
    ];
    if (text.length > 90) return true;
    if (text.includes("?")) return true;
    return openEndedSignals.some(signal => text.includes(signal));
  };

  const handleQuery = async rawText => {
    const text = rawText.trim();
    if (!text) return;
    input.value = "";
    addMessage(text, "user");
    setStatus("pensando...");

    const localReply = getReply(text);
    let reply = localReply;
    const useClaude = shouldUseClaude(text, localReply);

    if (useClaude) {
      try {
        setStatus("consultando a Claude...");
        const ctrl = new AbortController();
        const apiTimer = setTimeout(() => ctrl.abort(), 6000);
        const response = await fetch("/api/gaby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: text,
            history: conversation.slice(0, -1).slice(-12),
            leadState,
          }),
          signal: ctrl.signal,
        });
        clearTimeout(apiTimer);
        if (response.ok) {
          const data = await response.json();
          if (data && data.reply) reply = data.reply;
        }
      } catch (error) {
        if (error.name !== "AbortError") console.warn("Gaby API:", error);
      }
    }
    maybeSendLeadCapture(text, reply);

    if (state.listening && recognition) {
      voiceState.pendingReply = reply;
      try {
        recognition.stop();
      } catch (error) {
        console.warn("No se pudo detener el reconocimiento para responder:", error);
      }
      return;
    }

    window.setTimeout(() => {
      addMessage(reply, "gaby");
      speak(reply);
      if (!state.listening) setStatus("en línea · voz activada");
    }, 240);
  };

  const openWidget = () => {
    state.open = true;
    widget.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    if (!state.greeted) {
      state.greeted = true;
      addMessage("Hola, soy Gaby. Pregúntame por servicios, precios, contacto o proyectos. También puedes hablarme con el micrófono.", "gaby");
      speak("Hola, soy Gaby. Pregúntame por servicios, precios, contacto o proyectos. También puedes hablarme con el micrófono.");
    }
    window.setTimeout(() => input.focus(), 50);
    if (recognition && !state.listening) {
      state.voiceMode = true;
      setTimeout(() => {
        try { recognition.start(); } catch (e) {}
      }, 1800);
    }
  };

  const closeWidget = () => {
    state.open = false;
    state.voiceMode = false;
    widget.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    if (state.listening && recognition) {
      recognition.stop();
    }
  };

  launcher.addEventListener("click", () => {
    if (state.open) closeWidget();
    else openWidget();
  });

  closeBtn.addEventListener("click", closeWidget);

  form.addEventListener("submit", e => {
    e.preventDefault();
    handleQuery(input.value);
  });

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      handleQuery(chip.dataset.gabyQ || chip.textContent || "");
      if (!state.open) openWidget();
    });
  });

  if (recognition) {
    recognition.lang = "es-ES";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let partial = "";
    let queuedText = "";

    recognition.onstart = () => {
      state.listening = true;
      mic.classList.add("is-listening");
      setStatus("escuchando...");
    };

    recognition.onresult = event => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      partial = transcript.trim();
      input.value = partial;
      if (voiceState.pendingTimer) {
        window.clearTimeout(voiceState.pendingTimer);
        voiceState.pendingTimer = null;
      }
      if (partial) {
        queuedText = partial;
        voiceState.pendingTimer = window.setTimeout(() => {
          if (!queuedText || voiceState.handledTranscript === queuedText) return;
          voiceState.handledTranscript = queuedText;
          if (recognition && state.listening) {
            try {
              recognition.stop();
            } catch (error) {
              console.warn("No se pudo detener el reconocimiento:", error);
            }
          }
          handleQuery(queuedText);
          queuedText = "";
        }, 900);
      }
      const last = event.results[event.results.length - 1];
      if (last && last.isFinal) {
        const finalText = partial;
        if (voiceState.pendingTimer) {
          window.clearTimeout(voiceState.pendingTimer);
          voiceState.pendingTimer = null;
        }
        voiceState.handledTranscript = finalText;
        queuedText = "";
        try {
          recognition.stop();
        } catch (error) {
          console.warn("No se pudo detener el reconocimiento final:", error);
        }
        handleQuery(finalText);
        partial = "";
      }
    };

    recognition.onerror = event => {
      console.warn("Gaby voice error:", event.error);
      state.listening = false;
      mic.classList.remove("is-listening");
      if (voiceState.pendingTimer) {
        window.clearTimeout(voiceState.pendingTimer);
        voiceState.pendingTimer = null;
      }
      setStatus(event.error === "not-allowed" ? "micrófono bloqueado" : "en línea · voz activada");
    };

    recognition.onend = () => {
      state.listening = false;
      mic.classList.remove("is-listening");
      if (voiceState.pendingTimer) {
        window.clearTimeout(voiceState.pendingTimer);
        voiceState.pendingTimer = null;
      }
      if (voiceState.pendingReply) {
        const pendingReply = voiceState.pendingReply;
        voiceState.pendingReply = "";
        addMessage(pendingReply, "gaby");
        window.setTimeout(() => {
          speak(pendingReply);
        }, 180);
        return;
      }
      if (partial && voiceState.handledTranscript !== partial) {
        voiceState.handledTranscript = partial;
        queuedText = "";
        handleQuery(partial);
        partial = "";
      }
      if (!state.speaking) setStatus("en línea · voz activada");
    };

    mic.addEventListener("click", () => {
      if (state.listening) {
        state.voiceMode = false;
        recognition.stop();
        return;
      }
      state.voiceMode = true;
      try {
        recognition.start();
      } catch (error) {
        console.warn("No se pudo iniciar el micrófono:", error);
      }
    });
  } else {
    mic.disabled = true;
    mic.title = "Tu navegador no soporta reconocimiento de voz";
    mic.textContent = "×";
    setStatus("solo texto · voz no disponible");
  }

  addMessage("Dime qué necesitas. Puedo ayudarte con servicios, precios, contacto o proyectos.", "gaby");
})();

/* ── VIDEO AUDIO CONTROLS ─────────────────────────────────── */
(function setupVideoAudio() {
  const video = document.getElementById("hero-video");
  const unmuteBtn = document.getElementById("unmute-btn");
  if (video && unmuteBtn) {
    unmuteBtn.addEventListener("click", () => {
      if (video.muted) {
        video.muted = false;
        unmuteBtn.innerText = "DESACTIVAR AUDIO";
      } else {
        video.muted = true;
        unmuteBtn.innerText = "ACTIVAR AUDIO";
      }
    });
  }
})();
