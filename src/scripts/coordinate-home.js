// v010: a moss lead, a graphic cover and a quick release retain the cover-before-reveal order.
(() => {
  const screen = document.getElementById('geo-design');
  if (!screen) return;
  const fields = JSON.parse(screen.dataset.fields);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const settings = { entryDuration: 2800, inversion: true };
  let stopEntry = () => {};
  function animate(el, frames, options) {
    if (!el || reduced()) return null;
    return el.animate(
      frames,
      Object.assign({ easing: 'cubic-bezier(.22,1,.36,1)', fill: 'none' }, options)
    );
  }
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const ease = (value) => {
    const v = clamp(value);
    return v * v * (3 - 2 * v);
  };
  function prepareCanvas(canvas) {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return null;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(bounds.width * ratio),
      height = Math.round(bounds.height * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, bounds.width, bounds.height);
    return { ctx, width: bounds.width, height: bounds.height };
  }
  function paintObservatory(canvas, options = {}) {
    const surface = prepareCanvas(canvas);
    if (!surface) return;
    const { ctx, width, height } = surface;
    const frontSurface = options.frontCanvas ? prepareCanvas(options.frontCanvas) : null;
    const front = frontSurface && frontSurface.ctx;
    const cx = options.cx ?? width * 0.52,
      cy = options.cy ?? height * 0.48;
    const radius = options.radius ?? Math.min(width, height) * 0.35;
    const phase = options.phase ?? 1,
      turn = options.turn ?? 0;
    const dark = !!options.dark,
      inverted = !!options.inverted;
    const entryWeight = options.entry ? (options.entryBlend ?? 1) : 0;
    const base = options.ink || (dark ? [183, 207, 198] : [48, 84, 76]);
    const ink = inverted ? (dark ? [33, 64, 56] : [217, 230, 218]) : base;
    const rgba = (rgb, alpha) => 'rgba(' + rgb.join(',') + ',' + alpha + ')';
    const project = (x, y, z) => {
      const a = 0.31 + turn,
        b = 0.47 + (options.tilt || 0),
        c = -0.22 + (options.roll || 0);
      const ax = x * Math.cos(a) + z * Math.sin(a),
        az = -x * Math.sin(a) + z * Math.cos(a);
      const by = y * Math.cos(b) - az * Math.sin(b),
        bz = y * Math.sin(b) + az * Math.cos(b);
      return {
        x: cx + radius * (ax * Math.cos(c) - by * Math.sin(c)),
        y: cy + radius * (ax * Math.sin(c) + by * Math.cos(c)),
        z: bz
      };
    };
    const projectOrbit = (x, y, z) => {
      const tilt = options.ringTurn || 0;
      const drift = options.orbitTurn || 0;
      const ox = x * Math.cos(drift) + z * Math.sin(drift),
        oz = -x * Math.sin(drift) + z * Math.cos(drift);
      return project(
        ox,
        y * Math.cos(tilt) - oz * Math.sin(tilt),
        y * Math.sin(tilt) + oz * Math.cos(tilt)
      );
    };
    const glow = ctx.createRadialGradient(
      cx - radius * 0.25,
      cy - radius * 0.35,
      0,
      cx,
      cy,
      radius * 1.36
    );
    glow.addColorStop(0, rgba(dark ? [126, 166, 145] : [166, 193, 168], dark ? 0.085 : 0.19));
    glow.addColorStop(1, rgba(dark ? [126, 166, 145] : [166, 193, 168], 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.36, 0, Math.PI * 2);
    ctx.fill();
    if (inverted) {
      ctx.fillStyle = dark ? '#dbe7db' : '#183034';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.99, 0, Math.PI * 2);
      ctx.fill();
    }
    if (options.silhouette > 0) {
      ctx.globalAlpha = options.silhouette;
      ctx.fillStyle = '#173b33';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.99, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    const ribbonSpan = ease(phase) * Math.PI * 1.73;
    const ribbon = ctx.createLinearGradient(
      cx - radius * 1.35,
      cy - radius * 0.5,
      cx + radius * 1.35,
      cy + radius * 0.5
    );
    ribbon.addColorStop(0, rgba(ink, 0.015));
    ribbon.addColorStop(0.42, rgba(ink, 0.075 + 0.115 * entryWeight));
    ribbon.addColorStop(0.73, rgba(ink, 0.045 + 0.075 * entryWeight));
    ribbon.addColorStop(1, rgba(ink, 0.015));
    let ribbonPrevious = null,
      ribbonRun = null;
    const ribbonRuns = [];
    for (let i = 0; i <= 100; i++) {
      const t = 0.22 + (ribbonSpan * i) / 100;
      const p = projectOrbit(Math.cos(t) * 1.29, Math.sin(t) * 0.5, Math.sin(t) * 1.11);
      if (ribbonPrevious) {
        const pen = front && p.z >= 0 ? front : ctx;
        if (!ribbonRun || ribbonRun.pen !== pen) {
          ribbonRun = { pen, points: [ribbonPrevious, p] };
          ribbonRuns.push(ribbonRun);
        } else ribbonRun.points.push(p);
      }
      ribbonPrevious = p;
    }
    for (const run of ribbonRuns) {
      const pen = run.pen;
      pen.strokeStyle = ribbon;
      pen.lineWidth = 5 + 8 * entryWeight;
      pen.lineCap = 'round';
      pen.beginPath();
      run.points.forEach((point, i) =>
        i === 0 ? pen.moveTo(point.x, point.y) : pen.lineTo(point.x, point.y)
      );
      pen.stroke();
      pen.lineCap = 'butt';
    }
    const curve = (sample, opacity = 0.35, lineWidth = 0.7, portion = 1, projection = project) => {
      const count = 96,
        end = Math.max(0.015, portion) * Math.PI * 2;
      let previous = null;
      for (let i = 0; i <= count; i++) {
        const t = (end * i) / count,
          p = sample(t),
          next = projection(p[0], p[1], p[2]);
        if (previous) {
          const depth = clamp((next.z + 1.2) / 2.4);
          const alpha = opacity * (0.22 + 0.78 * depth);
          const pen = front && next.z >= 0 ? front : ctx;
          pen.strokeStyle = rgba(ink, alpha);
          pen.lineWidth = lineWidth;
          pen.beginPath();
          pen.moveTo(previous.x, previous.y);
          pen.lineTo(next.x, next.y);
          pen.stroke();
        }
        previous = next;
      }
    };
    const opening = ease(phase);
    for (const latitude of [-Math.PI / 3, -Math.PI / 6, 0, Math.PI / 6, Math.PI / 3]) {
      curve(
        (t) => [
          Math.cos(latitude) * Math.sin(t),
          Math.sin(latitude),
          Math.cos(latitude) * Math.cos(t)
        ],
        inverted ? 0.72 : 0.52,
        0.65,
        opening
      );
    }
    for (let longitude = 0; longitude < 6; longitude++) {
      const l = (longitude * Math.PI) / 6;
      curve(
        (t) => [Math.sin(t) * Math.sin(l), Math.cos(t), Math.sin(t) * Math.cos(l)],
        inverted ? 0.7 : 0.46,
        0.7,
        opening
      );
    }
    const rim = front || ctx;
    rim.strokeStyle = rgba(ink, inverted ? 0.62 : 0.32);
    rim.lineWidth = 0.8;
    rim.beginPath();
    rim.arc(cx, cy, radius, Math.PI * 0.12, Math.PI * (0.12 + 1.74 * opening));
    rim.stroke();
    for (let ring = 0; ring < 4; ring++) {
      const r = 1.24 + ring * 0.025;
      curve(
        (t) => [Math.cos(t) * r, Math.sin(t) * r * 0.39, Math.sin(t) * r * 0.86],
        0.12 + ring * 0.028,
        ring === 3 ? 1.2 : 0.6,
        opening,
        projectOrbit
      );
    }
    const orbit = 1.45;
    ctx.strokeStyle = rgba(base, 0.15);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      radius * orbit,
      radius * 0.51,
      -0.34 + (options.ringTurn || 0),
      Math.PI * 0.93,
      Math.PI * (0.93 + 0.76 * opening)
    );
    ctx.stroke();
    const angle = 0.65 + (options.index || 0) * 0.19 + (options.markTurn ?? turn);
    const mark = project(Math.sin(angle) * 0.78, -0.38, Math.cos(angle) * 0.78);
    const accent = options.accent ?? 0;
    const markPen = front && mark.z >= 0 ? front : ctx;
    const focus = options.focus || 0;
    if (focus > 0) {
      const progress = ease(options.focusProgress || 0);
      const head = angle - 0.78 * (1 - progress),
        span = 0.72 * progress;
      const traceRuns = [];
      let previous = null,
        run = null;
      for (let i = 0; i <= 48; i++) {
        const t = head - span + (span * i) / 48;
        const point = project(Math.sin(t) * 0.78, -0.38, Math.cos(t) * 0.78);
        if (previous) {
          const pen = front && point.z >= 0 ? front : ctx;
          if (!run || run.pen !== pen) {
            run = { pen, points: [previous, point] };
            traceRuns.push(run);
          } else run.points.push(point);
        }
        previous = point;
      }
      for (const trace of traceRuns) {
        trace.pen.strokeStyle = rgba(dark ? [183, 207, 198] : [23, 70, 83], 0.9 * focus);
        trace.pen.lineWidth = Math.max(2, Math.min(4, radius * 0.018));
        trace.pen.lineCap = 'round';
        trace.pen.beginPath();
        trace.points.forEach((point, i) =>
          i === 0 ? trace.pen.moveTo(point.x, point.y) : trace.pen.lineTo(point.x, point.y)
        );
        trace.pen.stroke();
        trace.pen.lineCap = 'butt';
      }
    }
    if (accent > 0) {
      markPen.strokeStyle = rgba(dark ? [211, 164, 125] : [185, 134, 94], 0.82 * accent);
      markPen.lineWidth = 1.5;
      markPen.lineCap = 'round';
      markPen.beginPath();
      for (let i = 0; i <= 24; i++) {
        const t = angle - 0.4 + (0.4 * i) / 24,
          point = project(Math.sin(t) * 0.78, -0.38, Math.cos(t) * 0.78);
        if (i === 0) markPen.moveTo(point.x, point.y);
        else markPen.lineTo(point.x, point.y);
      }
      markPen.stroke();
      markPen.lineCap = 'butt';
    }
    markPen.fillStyle = dark ? '#d3a47d' : '#b9865e';
    markPen.beginPath();
    markPen.arc(mark.x, mark.y, 2.8 + accent * 0.7, 0, Math.PI * 2);
    markPen.fill();
    const horizon = project(-1.02, 0, 0);
    ctx.strokeStyle = rgba(base, 0.22);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(horizon.x - radius * 0.42, horizon.y);
    ctx.lineTo(horizon.x - radius * 0.1, horizon.y);
    ctx.stroke();
    ctx.fillStyle = rgba(base, 0.5);
    ctx.beginPath();
    ctx.arc(horizon.x, horizon.y, 1.3, 0, Math.PI * 2);
    ctx.fill();
    if (options.annotation) {
      const endpoints = [project(-0.86, -0.3, 0.35), project(0.88, 0.35, 0.3)];
      const routes = [
        [
          [15, 65],
          [cx - radius * 1.65, cy - radius * 0.57],
          [endpoints[0].x, endpoints[0].y]
        ],
        [
          [width - 17, height - 52],
          [cx + radius * 1.58, cy + radius * 0.63],
          [endpoints[1].x, endpoints[1].y]
        ]
      ];
      ctx.strokeStyle = rgba(base, 0.23);
      ctx.lineWidth = 0.7;
      for (const route of routes) {
        ctx.beginPath();
        route.forEach((point, i) =>
          i === 0 ? ctx.moveTo(point[0], point[1]) : ctx.lineTo(point[0], point[1])
        );
        ctx.stroke();
        const last = route[route.length - 1];
        ctx.fillStyle = rgba(base, 0.4);
        ctx.beginPath();
        ctx.arc(last[0], last[1], 1.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  let running = false;
  let selected = 0;
  let fieldFrame = 0;
  let fieldRevision = 0;
  let fieldTransition = null;
  const art = screen.querySelector('.geo-art');
  const results = screen.querySelector('.geo-results');
  const status = screen.querySelector('.geo-filter-status');
  const views = Array.from(screen.querySelectorAll('template[data-home-view]'));
  function drawArtwork() {
    paintObservatory(art, {
      dark: getComputedStyle(screen).backgroundColor === 'rgb(14, 24, 26)',
      index: 0
    });
  }
  new ResizeObserver(drawArtwork).observe(art);
  function finishFieldTransition(announce = true) {
    cancelAnimationFrame(fieldFrame);
    fieldFrame = 0;
    if (!fieldTransition) return;
    const { incoming, outgoing, veils } = fieldTransition;
    outgoing.remove();
    veils.forEach((veil) => veil.remove());
    incoming.style.removeProperty('clip-path');
    incoming.classList.remove('geo-incoming');
    incoming.inert = false;
    results.style.removeProperty('height');
    results.classList.remove('is-switching');
    results.setAttribute('aria-busy', 'false');
    results.dataset.switchPhase = '100';
    results.dataset.wipeStage = 'complete';
    fieldTransition = null;
    if (announce) status.textContent = `${fields[selected].name}，${fields[selected].count}篇文章`;
  }
  function fieldVeil(tone, height) {
    // The planes carry geometry only, never inverted or duplicated article content.
    const veil = document.createElement('div');
    veil.className = `geo-field-veil geo-field-veil--${tone}`;
    veil.setAttribute('aria-hidden', 'true');
    veil.inert = true;
    veil.style.height = height + 'px';
    veil.style.clipPath = 'inset(0 0 0 100%)';
    if (tone === 'cover') {
      const graphic = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      graphic.classList.add('geo-field-graphic');
      graphic.setAttribute('viewBox', '0 0 900 600');
      graphic.setAttribute('aria-hidden', 'true');
      graphic.innerHTML = `
        <path class="geo-cover-orbit" d="M88 610C176 148 588-76 992 78"/>
        <path class="geo-cover-orbit" d="M272 680C212 310 474 4 906-28"/>
        <path class="geo-cover-guide" d="M310 80H720M500 340H940"/>
        <path class="geo-cover-route" d="M525 66C590 45 670 30 752 26"/>
        <path class="geo-cover-streak" d="M142 274H260M318 274H348M270 420H350"/>`;
      veil.append(graphic);
    }
    return veil;
  }
  function fieldWaveGeometry(width, height) {
    const baseBow = Math.min(width * 0.025, 20);
    const bowTension = Math.min(width * 0.06, 52);
    const baseTilt = Math.min(width * 0.05, 40);
    const tiltTension = Math.min(width * 0.08, 66);
    const overscan = baseBow + bowTension + baseTilt + tiltTension + 2;
    const boundary = (progress, release = false) => {
      const travel = 1 - Math.pow(1 - clamp(progress), release ? 3 : 4);
      const tension = Math.sin(Math.PI * travel);
      const bow = (baseBow + bowTension * tension) * (release ? -0.55 : 1);
      const tilt = baseTilt + tiltTension * tension;
      const x = width + overscan - (width + overscan * 2) * travel;
      return Array.from({ length: 33 }, (_, i) => {
        const y = i / 32;
        // The cut leans and bends in flight, then relaxes as it clears the content.
        return [x + bow * (4 * (y - 0.5) ** 2 - 1) + tilt * (0.5 - y), y * height];
      });
    };
    const polygon = (points) =>
      `polygon(${points.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(',')})`;
    return {
      boundary,
      left: (edge) => polygon([[-1, -1], ...edge, [-1, height + 1]]),
      right: (edge) =>
        polygon([[width + 1, -1], [width + 1, height + 1], ...edge.slice().reverse()])
    };
  }
  function selectField(index, motion = true) {
    if (!Number.isInteger(index) || !fields[index]) return;
    if (index === selected) {
      if (!motion) finishFieldTransition(false);
      return;
    }
    finishFieldTransition(false);
    const revision = ++fieldRevision;
    const outgoing = results.querySelector('.geo-panel');
    const oldHeight = outgoing.getBoundingClientRect().height;
    const incoming = views[index].content.firstElementChild.cloneNode(true);
    selected = index;
    screen.querySelectorAll('.geo-filter-controls [data-category]').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.category) === index));
    });
    if (outgoing.contains(document.activeElement)) {
      screen
        .querySelector(`.geo-filter-controls [data-category="${index}"]`)
        .focus({ preventScroll: true });
    }
    status.textContent = '';
    if (!motion || reduced()) {
      results.replaceChildren(incoming);
      status.textContent = `${fields[index].name}，${fields[index].count}篇文章`;
      return;
    }
    outgoing.classList.add('geo-outgoing');
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.inert = true;
    incoming.inert = true;
    incoming.classList.add('geo-incoming');
    incoming.style.clipPath = 'inset(0 0 0 100%)';
    results.replaceChildren(incoming, outgoing);
    const nextHeight = incoming.getBoundingClientRect().height;
    const waveHeight = Math.max(oldHeight, nextHeight);
    const geometry = fieldWaveGeometry(results.getBoundingClientRect().width, waveHeight);
    const veils = [
      fieldVeil('lead', waveHeight),
      fieldVeil('cover', waveHeight),
      fieldVeil('reveal', waveHeight)
    ];
    const graphic = veils[1].querySelector('.geo-field-graphic');
    results.append(...veils);
    results.style.height = oldHeight + 'px';
    results.classList.add('is-switching');
    results.setAttribute('aria-busy', 'true');
    results.dataset.wipeDirection = 'right-to-left';
    results.dataset.wipeMotion = 'kinetic-cover-reveal';
    results.dataset.switchPhase = '0';
    results.dataset.wipeStage = 'cover';
    fieldTransition = { incoming, outgoing, veils, revision };
    const start = performance.now();
    function frame(now) {
      if (fieldTransition?.revision !== revision) return;
      const elapsed = now - start;
      const progress = clamp(elapsed / 600);
      const lead = clamp(elapsed / 190);
      const cover = clamp((elapsed - 24) / 190);
      const reveal = clamp((elapsed - 260) / 270);
      const leadEdge = geometry.boundary(lead);
      const coverEdge = geometry.boundary(cover);
      const revealEdge = geometry.boundary(reveal, true);
      // The green lead erases the old text; only after both cover planes land does the release begin.
      outgoing.style.clipPath = geometry.left(leadEdge);
      outgoing.hidden = lead === 1;
      veils[0].style.clipPath = geometry.right(leadEdge);
      veils[1].style.clipPath = geometry.right(coverEdge);
      veils[2].style.clipPath = geometry.right(revealEdge);
      incoming.style.clipPath = geometry.right(revealEdge);
      const graphicLag = Math.pow(1 - clamp((elapsed - 38) / 210), 3);
      graphic.style.transform = `translate(${36 * graphicLag}px,${-5 * graphicLag}px) rotate(${-3 * graphicLag}deg)`;
      results.style.height = oldHeight + (nextHeight - oldHeight) * ease(reveal) + 'px';
      results.dataset.switchPhase = String(Math.round(progress * 100));
      results.dataset.wipeStage =
        elapsed < 214 ? 'cover' : elapsed < 260 ? 'hold' : elapsed < 530 ? 'reveal' : 'settle';
      results.dataset.wipeEdge = revealEdge[16][0].toFixed(2);
      if (progress < 1) fieldFrame = requestAnimationFrame(frame);
      else finishFieldTransition();
    }
    fieldFrame = requestAnimationFrame(frame);
  }
  screen.addEventListener('click', (event) => {
    const button =
      event.target instanceof Element ? event.target.closest('button[data-category]') : null;
    if (button && screen.contains(button)) selectField(Number(button.dataset.category));
  });
  async function playEntry() {
    if (running) return;
    if (reduced()) return;
    const previousFocus = document.activeElement;
    const inactive = [
      screen.querySelector('.geo-content'),
      document.querySelector('.skip-link'),
      document.querySelector('.site-header'),
      document.querySelector('.site-footer'),
      ...document.querySelectorAll(
        'main > .home-section, main > .home-topics, main > .home-personal-note'
      )
    ].filter(Boolean);
    inactive.forEach((element) => (element.inert = true));
    selectField(selected, false);
    running = true;
    const layer = screen.querySelector('.geo-entry');
    const identities = Array.from(layer.querySelectorAll('.geo-entry-identity'));
    layer.hidden = false;
    delete document.documentElement.dataset.homeEntry;
    layer.focus({ preventScroll: true });
    const duration = settings.entryDuration;
    const count = [];
    identities.forEach((identity) => {
      count.push(
        animate(
          identity.querySelector('.geo-entry-kicker > span'),
          [
            { opacity: 0, transform: 'translateY(105%)', letterSpacing: '.18em' },
            { opacity: 1, transform: 'translateY(0)', letterSpacing: '.12em' }
          ],
          {
            duration: duration * 0.1,
            delay: duration * 0.012,
            easing: 'cubic-bezier(.16,1,.3,1)',
            fill: 'both'
          }
        )
      );
      identity.querySelectorAll('.geo-entry-title > span').forEach((part, i) =>
        count.push(
          animate(
            part,
            [
              { opacity: 0, transform: 'translateY(105%)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            {
              duration: duration * 0.2,
              delay: duration * (i === 0 ? 0.035 : 0.34),
              easing: 'cubic-bezier(.22,.65,.3,1)',
              fill: 'both'
            }
          )
        )
      );
    });
    const inverseLayer = layer.querySelector('.geo-entry-inverse');
    inverseLayer.hidden = true;
    inverseLayer.style.clipPath = 'circle(0px at 170% 170%)';
    const screenStyle = getComputedStyle(screen);
    const homepageDark = screenStyle.backgroundColor === 'rgb(14, 24, 26)';
    const darkPalette = {
      name: '深森林绿',
      background: '#173b33',
      text: '#e3ece1',
      ink: [183, 207, 198],
      dark: true
    };
    const homepagePalette = {
      name: '主页',
      background: screenStyle.backgroundColor,
      image: screenStyle.backgroundImage,
      text: screenStyle.color,
      ink: homepageDark ? [183, 207, 198] : [48, 84, 76],
      dark: homepageDark,
      home: true,
      start: 0.7,
      end: 0.84
    };
    const colorStages = settings.inversion
      ? [
          {
            name: '苔绿',
            background: '#5b7f65',
            text: '#f1f4f1',
            ink: [218, 232, 213],
            dark: true,
            start: 0.09,
            end: 0.23
          },
          {
            name: '浅绿',
            background: '#e3ece1',
            text: '#173b33',
            ink: [48, 84, 76],
            dark: false,
            start: 0.32,
            end: 0.44
          },
          homepagePalette
        ]
      : [homepagePalette];
    const applyPalette = (surface, palette) => {
      if (surface.dataset.palette === palette.name) return;
      surface.style.backgroundColor = palette.background;
      surface.style.backgroundImage = palette.image || 'none';
      surface.style.color = palette.text;
      surface.dataset.palette = palette.name;
    };
    layer.dataset.palette = '';
    inverseLayer.dataset.palette = '';
    layer.dataset.visited = darkPalette.name;
    applyPalette(layer, darkPalette);
    const screenBox = layer.getBoundingClientRect(),
      artBox = art.getBoundingClientRect();
    const targetX = artBox.left - screenBox.left + artBox.width * 0.52,
      targetY = artBox.top - screenBox.top + artBox.height * 0.48;
    layer.style.setProperty('--geo-focus-x', (targetX / screenBox.width) * 100 + '%');
    layer.style.setProperty('--geo-focus-y', (targetY / screenBox.height) * 100 + '%');
    const entryArt = layer.querySelector('.geo-entry-composition > .geo-entry-art');
    const entryFront = layer.querySelector('.geo-entry-composition > .geo-entry-front');
    const inverseArt = inverseLayer.querySelector('.geo-entry-art');
    const inverseFront = inverseLayer.querySelector('.geo-entry-front');
    const baseType = layer.querySelector('.geo-entry-composition > .geo-entry-big');
    const incomingType = inverseLayer.querySelector('.geo-entry-big');
    const narrow = screenBox.width < 650;
    const sceneHeight = Math.min(screenBox.height, narrow ? 700 : 760);
    layer
      .querySelectorAll('.geo-entry-identity')
      .forEach((text) => (text.style.top = sceneHeight * 0.2 + 'px'));
    const originalWords = ['FIELD', 'JOURNAL'];
    const finalRadius =
      (Math.min(artBox.width, artBox.height) * 0.35) / Math.min(screenBox.width, sceneHeight);
    const radiusAt = (weight) =>
      finalRadius + (Math.max(0.52, finalRadius * 1.8) - finalRadius) * weight;
    const poses = [
      { at: 0, x: 0.89, y: 0.43, r: radiusAt(1), turn: 1.28 },
      { at: 0.22, x: 0.75, y: 0.44, r: radiusAt(0.68), turn: 0.78 },
      { at: 0.42, x: 0.68, y: 0.42, r: radiusAt(0.47), turn: 0.39 },
      { at: 0.56, x: 0.67, y: 0.45, r: radiusAt(0.32), turn: 0.16 },
      { at: 0.68, x: 0.69, y: 0.46, r: radiusAt(0.2), turn: 0.055 },
      { at: 0.84, x: targetX / screenBox.width, y: targetY / sceneHeight, r: finalRadius, turn: 0 }
    ];
    const poseKeys = ['x', 'y', 'r', 'turn'];
    const slope = (index, key) => {
      if (index === 0 || index === poses.length - 1) return 0;
      const before = poses[index - 1],
        here = poses[index],
        after = poses[index + 1];
      const left = (here[key] - before[key]) / (here.at - before.at);
      const right = (after[key] - here[key]) / (after.at - here.at);
      if (left * right <= 0) return 0;
      const d0 = here.at - before.at,
        d1 = after.at - here.at;
      return (3 * (d0 + d1)) / ((2 * d1 + d0) / left + (d1 + 2 * d0) / right);
    };
    const samplePose = (p) => {
      const next = poses.findIndex((pose) => pose.at > p);
      if (next < 0) return poses[poses.length - 1];
      if (next === 0) return poses[0];
      const before = poses[next - 1],
        after = poses[next],
        span = after.at - before.at,
        t = clamp((p - before.at) / span);
      const pose = {};
      const h0 = 2 * t * t * t - 3 * t * t + 1,
        h1 = t * t * t - 2 * t * t + t,
        h2 = -2 * t * t * t + 3 * t * t,
        h3 = t * t * t - t * t;
      for (const key of poseKeys)
        pose[key] =
          h0 * before[key] +
          h1 * span * slope(next - 1, key) +
          h2 * after[key] +
          h3 * span * slope(next, key);
      return pose;
    };
    const styleType = (element, palette, outline, p) => {
      const words = originalWords;
      const key = words.join('/');
      if (element.dataset.words !== key) {
        element.replaceChildren(
          ...words.map((word) => {
            const line = document.createElement('span');
            line.className = 'geo-entry-line';
            line.textContent = word;
            return line;
          })
        );
        element.dataset.words = key;
      }
      const rgb = palette.text.startsWith('#')
        ? palette.text
            .slice(1)
            .match(/.{2}/g)
            .map((part) => parseInt(part, 16))
        : palette.text
            .match(/[\d.]+/g)
            .slice(0, 3)
            .map(Number);
      element.style.color = palette.text;
      element.style.webkitTextStrokeWidth = '0px';
      element.style.left = screenBox.width * 0.08 + 'px';
      element.style.top = sceneHeight * (narrow ? 0.38 : 0.36) + 'px';
      element.style.right = 'auto';
      element.style.fontSize =
        (narrow
          ? screenBox.width * (words[1] === 'NOTES' ? 0.35 : 0.27)
          : Math.min(208, screenBox.width * 0.22)) + 'px';
      const depart = ease((p - 0.69) / 0.12);
      element.style.transform = 'translateY(' + -12 * depart + 'px)';
      element.style.opacity = String(1 - depart);
      Array.from(element.children).forEach((line, i) => {
        const enter = 1 - Math.pow(1 - clamp((p - (i === 0 ? 0.035 : 0.065)) / 0.13), 3);
        line.style.opacity = String(enter);
        line.style.transform =
          'translate(' +
          (1 - enter) * (i === 0 ? 10 : narrow ? 8 : 22) +
          'px,' +
          (1 - enter) * 18 +
          'px)';
        line.style.color =
          i === 0 ? palette.text : 'rgba(' + rgb.join(',') + ',' + (1 - outline) + ')';
        line.style.webkitTextStrokeWidth =
          i === 0 ? '0px' : (narrow ? 0.85 : 1.15) * outline + 'px';
        line.style.webkitTextStrokeColor = palette.text;
      });
    };
    const diagonal = Math.hypot(screenBox.width, screenBox.height);
    const waveOffset = diagonal * 0.7;
    const waveX = screenBox.width + waveOffset,
      waveY = screenBox.height + waveOffset;
    const waveStart = Math.hypot(waveOffset, waveOffset) - 1;
    const waveEnd = Math.hypot(waveX, waveY) + 2;
    const start = performance.now();
    let stopped = false,
      entryFrame = 0;
    const geometry = new Promise((resolve) => {
      stopEntry = () => {
        stopped = true;
        cancelAnimationFrame(entryFrame);
        identities.forEach((identity) => (identity.style.opacity = '0'));
        count.forEach((animation) => animation?.cancel());
        resolve();
      };
      function frame(now) {
        if (stopped) return;
        const p = clamp((now - start) / duration),
          pose = samplePose(p);
        // Keep both color layers on one clock. CSS also remains invisible after cleanup.
        const identityExit = clamp((p / 0.82 - 0.87) / 0.13);
        identities.forEach((identity) => {
          identity.style.opacity = String(1 - identityExit);
          identity.style.transform = `translateY(${-6 * identityExit}px)`;
        });
        const radius = Math.min(screenBox.width, sceneHeight) * pose.r;
        const drift = Math.sin(Math.PI * clamp(p / 0.84)) * (1 - ease((p - 0.69) / 0.15));
        const laggedPhase = clamp(p - 80 / duration);
        const ringTurn =
          (-0.25 * Math.sin(Math.PI * clamp(laggedPhase / 0.78)) +
            0.045 * Math.sin(laggedPhase * Math.PI * 3) * drift) *
          (1 - ease((p - 0.72) / 0.12));
        const orbitTurn = -0.12 * Math.sin(laggedPhase * Math.PI * 1.3) * drift;
        const markTurn =
          samplePose(Math.max(0, p - 80 / duration)).turn * (1 - ease((p - 0.76) / 0.08));
        const outline = ease((p - 0.32) / 0.12);
        const silhouette = settings.inversion
          ? ease((p - 0.08) / 0.1) * (1 - ease((p - 0.32) / 0.12))
          : 0;
        const focus = settings.inversion
          ? ease((p - 0.46) / 0.09) * (1 - ease((p - 0.64) / 0.12))
          : 0;
        const accent = ease((p - 0.54) / 0.08) * (1 - ease((p - 0.7) / 0.14));
        const observation = {
          cx: screenBox.width * pose.x + radius * 0.055 * Math.sin(p * Math.PI * 2 - 0.5) * drift,
          cy: sceneHeight * pose.y + radius * 0.055 * Math.sin(p * Math.PI * 1.7) * drift,
          radius,
          turn: pose.turn + 0.08 * Math.sin(p * Math.PI * 2) * drift,
          tilt: 0.14 * Math.sin(p * Math.PI * 1.6) * drift,
          roll: 0.07 * Math.sin(p * Math.PI * 1.2) * drift,
          ringTurn,
          orbitTurn,
          markTurn,
          phase: ease(p / 0.16),
          index: 0,
          entry: true,
          entryBlend: 1 - ease((p - 0.67) / 0.17),
          accent,
          focus,
          focusProgress: clamp((p - 0.46) / 0.16)
        };
        let previous = darkPalette,
          incoming = null;
        for (const stage of colorStages) {
          if (p >= stage.end) previous = stage;
          else if (p >= stage.start) {
            incoming = stage;
            break;
          } else break;
        }
        const render = (canvas, front, palette) => {
          const ink = palette.dark
            ? palette.ink
            : palette.ink.map(
                (channel, i) => channel + ([218, 232, 213][i] - channel) * silhouette
              );
          paintObservatory(canvas, {
            ...observation,
            frontCanvas: front,
            dark: palette.dark,
            ink,
            silhouette: palette.home ? 0 : silhouette,
            focus: palette.home ? 0 : focus,
            inverted: false
          });
        };
        applyPalette(layer, previous);
        styleType(baseType, previous, outline, p);
        render(entryArt, entryFront, previous);
        inverseLayer.hidden = !incoming;
        if (incoming) {
          applyPalette(inverseLayer, incoming);
          styleType(incomingType, incoming, outline, p);
          render(inverseArt, inverseFront, incoming);
          const wave = ease((p - incoming.start) / (incoming.end - incoming.start));
          inverseLayer.style.clipPath =
            'circle(' +
            (waveStart + (waveEnd - waveStart) * wave) +
            'px at ' +
            waveX +
            'px ' +
            waveY +
            'px)';
          layer.dataset.wave = String(Math.round(wave * 100));
          const visited = layer.dataset.visited.split(' / ');
          if (!visited.includes(incoming.name)) layer.dataset.visited += ' / ' + incoming.name;
        } else layer.dataset.wave = '100';
        if (focus > 0 && !layer.dataset.visited.includes('深青轨迹'))
          layer.dataset.visited += ' / 深青轨迹';
        layer.dataset.color = incoming ? incoming.name : previous.name;
        layer.dataset.scene =
          p < 0.23
            ? '近景与剪影'
            : p < 0.44
              ? '地理与留白'
              : p < 0.69
                ? '地理计算聚焦'
                : '主页落位';
        layer.dataset.region = incoming ? '右下向左上' : '全幅';
        layer.dataset.focus = String(Math.round(focus * 100));
        layer.dataset.tilt = String(Math.round((observation.tilt * 180) / Math.PI));
        layer.dataset.roll = String(Math.round((observation.roll * 180) / Math.PI));
        layer.dataset.outline = String(Math.round(outline * 100));
        layer.dataset.ringTurn = String(Math.round((ringTurn * 180) / Math.PI));
        layer.dataset.phase = String(Math.round(p * 100));
        if (p < 1) entryFrame = requestAnimationFrame(frame);
        else resolve();
      }
      entryFrame = requestAnimationFrame(frame);
    });
    const radius = Math.hypot(screenBox.width, screenBox.height) + 40;
    const reveal = animate(
      layer,
      [{ '--geo-entry-hole': '0px' }, { '--geo-entry-hole': radius + 'px' }],
      { duration: duration * 0.16, delay: duration * 0.84, fill: 'forwards' }
    );
    count.push(reveal);
    screen.querySelectorAll('.geo-text-window > span').forEach((text, i) =>
      count.push(
        animate(text, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], {
          duration: duration * 0.14,
          delay: duration * 0.84 + i * 30
        })
      )
    );
    count.push(
      animate(
        screen.querySelector('.geo-rule'),
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: duration * 0.14, delay: duration * 0.86 }
      )
    );
    try {
      await Promise.all([
        geometry,
        ...count.filter(Boolean).map((animation) => animation.finished.catch(() => {}))
      ]);
    } finally {
      stopped = true;
      cancelAnimationFrame(entryFrame);
      const restoreFocus = document.activeElement === layer;
      layer.hidden = true;
      identities.forEach((identity) => {
        identity.style.removeProperty('opacity');
        identity.style.removeProperty('transform');
      });
      count.filter(Boolean).forEach((animation) => animation.cancel());
      inactive.forEach((element) => (element.inert = false));
      running = false;
      stopEntry = () => {};
      if (restoreFocus) {
        const focus =
          previousFocus instanceof HTMLElement &&
          previousFocus !== document.body &&
          previousFocus.isConnected
            ? previousFocus
            : document.querySelector('#home-title');
        focus?.focus({ preventScroll: true });
      }
    }
  }

  screen.querySelector('.geo-filter-controls').hidden = false;
  document.addEventListener('keydown', (event) => {
    if (running && (event.key === 'Escape' || event.key === 'Tab')) {
      event.preventDefault();
      stopEntry();
    }
  });
  window.addEventListener('resize', () => {
    if (running) stopEntry();
    finishFieldTransition(false);
  });
  window.addEventListener(
    'wheel',
    () => {
      if (running) stopEntry();
    },
    { passive: true }
  );
  window.addEventListener(
    'touchmove',
    () => {
      if (running) stopEntry();
    },
    { passive: true }
  );
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    if (reduced()) {
      stopEntry();
      selectField(selected, false);
    }
  });
  new MutationObserver(() => {
    if (running) stopEntry();
    finishFieldTransition(false);
    drawArtwork();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  drawArtwork();
  let firstVisit = false;
  try {
    firstVisit = !sessionStorage.getItem('linzii-entry-seen');
    sessionStorage.setItem('linzii-entry-seen', '1');
  } catch {}
  // Returning from an article and restored browser history retain the reading position.
  if (firstVisit && !reduced() && !location.hash && window.scrollY < 80) {
    const fonts = document.fonts
      ? Promise.all([
          document.fonts.load('500 100px "Barlow Condensed"'),
          document.fonts.load('400 32px "Barlow Condensed"')
        ])
      : Promise.resolve();
    Promise.race([fonts.catch(() => {}), new Promise((resolve) => setTimeout(resolve, 450))]).then(
      () => {
        if (window.scrollY < 80 && !location.hash) return playEntry();
        delete document.documentElement.dataset.homeEntry;
      }
    );
  } else delete document.documentElement.dataset.homeEntry;
  window.addEventListener('pagehide', () => {
    stopEntry();
    finishFieldTransition(false);
  });
})();
