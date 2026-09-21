/* Home hero: the portrait's bottom edge crumbles away through a noise mask (see .portrait in
   main.css). This adds the loose dust that falls out from under the portrait and pours down into
   the section below the hero. Decorative only.

   Cost, by design: no image is read at run time (the silhouette is a precomputed constant), the
   setup waits until the page has loaded and the browser is idle, drawing is capped at ~30 fps at
   a device-pixel ratio of 1, and the loop only runs while the canvas is on screen. */
(function () {
  var hero = document.querySelector('.hero');
  var img = hero && hero.querySelector('.portrait');
  if (!img) return;

  /* dissolve band of the mask, as fractions of the portrait's height — keep in sync with main.css */
  var BAND_START = 0.80;
  var BAND_END = 0.99;
  /* silhouette extents (fractions of the portrait's width) for each row of the band, taken from the
     portrait's own alpha. Regenerate with `python3 _tools/portrait-silhouette.py` if the portrait changes. */
  var ROWS = [[0.25,0.796],[0.25,0.787],[0.25,0.787],[0.25,0.787],[0.25,0.787],[0.241,0.787],[0.241,0.787],[0.241,0.787],[0.241,0.787],[0.241,0.796],[0.241,0.796],[0.241,0.796],[0.231,0.796],[0.231,0.796],[0.231,0.796],[0.231,0.806],[0.231,0.806],[0.231,0.806],[0.231,0.806],[0.231,0.806],[0.222,0.806],[0.222,0.806],[0.222,0.806],[0.222,0.815],[0.222,0.815],[0.213,0.815],[0.213,0.815],[0.222,0.815],[0.222,0.815],[0.222,0.815]];
  var FRAME_MS = 32;        /* ~30 fps: the specks are slow and faint, 60 fps buys nothing */
  var COLORS = ['178,166,148', '178,166,148', '178,166,148', '196,150,62']; /* muted warm dust, a little gold */
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var parts = [];
  var cw = 0, ch = 0;     /* canvas size in CSS px */
  var box = null;         /* portrait box in canvas coordinates */
  var target = 0;         /* how many specks are alive at once */
  var visible = true, raf = 0, timer = 0, last = 0, carry = 0, t0 = 0;

  function layout() {
    /* device-pixel ratio 1 on purpose: specks are 0.5–2 px at 14–40 % alpha, so a 2x canvas is
       four times the pixels to clear and composite for no visible gain */
    cw = canvas.clientWidth;
    ch = canvas.clientHeight;
    canvas.width = cw;
    canvas.height = ch;
    /* the canvas reaches past the hero's bottom edge, and the portrait is anchored to that edge;
       offsetWidth/Height ignore the entrance transform */
    var edge = hero.offsetHeight - canvas.offsetTop;
    var w = img.offsetWidth, h = img.offsetHeight;
    box = { x: (cw - w) / 2, y: edge - h, w: w, h: h };
    target = Math.max(50, Math.min(150, Math.round(w / 4.5)));
    parts = [];
  }

  function spawn(now) {
    /* denser toward the bottom, where the mask has erased more */
    var f = BAND_START + (BAND_END - BAND_START) * Math.sqrt(Math.random());
    var i = Math.min(ROWS.length - 1, Math.floor((f - BAND_START) / (1 - BAND_START) * ROWS.length));
    var r = ROWS[i];
    if (!r) return null;
    var size = 0.5 + Math.random() * Math.random() * 1.7;
    return {
      x: box.x + (r[0] + Math.random() * (r[1] - r[0])) * box.w,
      y: box.y + f * box.h,
      vx: -6 + Math.random() * 22,          /* faint draught, mostly to the right */
      v0: Math.random() * 8,                /* small push as it breaks loose */
      vt: 22 + size * 20 + Math.random() * 18, /* terminal fall speed — bigger specks fall faster */
      tau: 1.2 + Math.random() * 1.2,       /* how quickly it gets there */
      wa: 2 + Math.random() * 5,            /* flutter */
      wf: 0.8 + Math.random() * 1.6,
      ph: Math.random() * 6.283,
      r: size,
      a: 0.14 + Math.random() * 0.26,
      fill: 'rgb(' + COLORS[(Math.random() * COLORS.length) | 0] + ')',
      life: 4 + Math.random() * 4,
      born: now
    };
  }

  function draw(now) {
    ctx.clearRect(0, 0, cw, ch);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i], t = now - p.born;
      if (t >= p.life) { parts.splice(i, 1); continue; }
      var k = t / p.life;
      var env = k < 0.12 ? k / 0.12 : Math.pow(1 - (k - 0.12) / 0.88, 1.3);
      var e = 1 - Math.exp(-t / p.tau);     /* drag: speed eases from v0 up to vt */
      ctx.globalAlpha = p.a * env;
      ctx.fillStyle = p.fill;
      ctx.beginPath();
      ctx.arc(
        p.x + p.vx * t + Math.sin(t * p.wf + p.ph) * p.wa,
        p.y + p.vt * (t - p.tau * e) + p.v0 * p.tau * e + Math.cos(t * p.wf * 0.8 + p.ph) * p.wa * 0.5,
        p.r, 0, 6.283
      );
      ctx.fill();
    }
  }

  /* The gap between frames is a timer, not a skipped requestAnimationFrame: a pending rAF makes the
     browser produce a frame on every vsync even when the callback returns early. */
  function next() {
    timer = 0;
    raf = requestAnimationFrame(frame);
  }

  function frame(ts) {
    raf = 0;
    var now = ts / 1000;
    if (!t0) t0 = now;
    var dt = last ? Math.min(now - last, 0.1) : 0;
    last = now;
    /* let the portrait finish fading in first, then ramp the dust up */
    var ramp = Math.max(0, Math.min(1, (now - t0 - 0.8) / 1.5));
    carry += (target / 6) * dt * ramp;
    while (carry >= 1) {
      carry -= 1;
      var p = spawn(now);
      if (p) parts.push(p);
    }
    draw(now);
    timer = setTimeout(next, FRAME_MS - 10);   /* rAF then lands on the next vsync: ~25–30 fps */
  }

  /* reduced motion: one frozen scatter, no animation */
  function paintStatic() {
    for (var i = 0; i < target; i++) {
      var p = spawn(0);
      if (!p) continue;
      p.born = -Math.random() * p.life * 0.55;
      parts.push(p);
    }
    draw(0);
  }

  /* only animate while the dust is on screen and the tab is visible */
  function sync() {
    var run = !reduced && visible && !document.hidden;
    if (run && !raf && !timer) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!run && (raf || timer)) {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      raf = timer = 0;
    }
  }

  function checkVisible() {
    var r = canvas.getBoundingClientRect();
    visible = r.bottom > 0 && r.top < window.innerHeight;
    sync();
  }

  function relayout() {
    layout();
    if (reduced) paintStatic();
    checkVisible();
  }

  function init() {
    canvas.className = 'hero-dust';
    canvas.setAttribute('aria-hidden', 'true');
    hero.appendChild(canvas);
    relayout();

    var pending = 0;
    function onResize() {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(relayout);
    }
    window.addEventListener('resize', onResize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        sync();
      }).observe(canvas);
    } else {
      var scrolling = 0;
      window.addEventListener('scroll', function () {
        if (scrolling) return;
        scrolling = requestAnimationFrame(function () {
          scrolling = 0;
          checkVisible();
        });
      }, { passive: true });
    }
    /* the portrait's height eases when the breakpoint flips — measure again once it settles */
    img.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'height') onResize();
    });
    document.addEventListener('visibilitychange', sync);
  }

  /* start only after the page has loaded and the browser has a spare moment, so the effect can never
     compete with the portrait (LCP), the fonts or the first paint */
  function schedule() {
    if (window.requestIdleCallback) window.requestIdleCallback(init, { timeout: 2500 });
    else setTimeout(init, 400);
  }
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();
