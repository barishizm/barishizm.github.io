/* Home hero: the portrait's bottom edge crumbles away through a noise mask (see .portrait in
   main.css). This adds the loose dust that falls out from under the portrait and pours down into
   the section below the hero. Decorative only. */
(function () {
  var hero = document.querySelector('.hero');
  var img = hero && hero.querySelector('.portrait');
  if (!img) return;

  /* dissolve band of the mask, as fractions of the portrait's height — keep in sync with main.css */
  var BAND_START = 0.80;
  var BAND_END = 0.99;
  var SAMPLE_W = 108;
  var COLORS = ['178,166,148', '178,166,148', '178,166,148', '196,150,62']; /* muted warm dust, a little gold */
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var rows = null;        /* silhouette extents per row of the dissolve band (fractions of width) */
  var parts = [];
  var cw = 0, ch = 0;     /* canvas size in CSS px */
  var box = null;         /* portrait box in canvas coordinates */
  var target = 0;         /* how many specks are alive at once */
  var visible = true, raf = 0, last = 0, carry = 0, t0 = 0;

  /* read the portrait's own alpha so dust only comes off the suit, not out of thin air */
  function sampleSilhouette() {
    var nw = img.naturalWidth, nh = img.naturalHeight;
    if (!nw || !nh) return;
    var sw = SAMPLE_W, sh = Math.round(sw * nh / nw);
    var c = document.createElement('canvas');
    c.width = sw;
    c.height = sh;
    var cx = c.getContext('2d');
    var data;
    try {
      cx.drawImage(img, 0, 0, sw, sh);
      data = cx.getImageData(0, 0, sw, sh).data;
    } catch (e) { return; }
    rows = [];
    for (var y = Math.floor(BAND_START * sh); y < sh; y++) {
      var min = -1, max = -1;
      for (var x = 0; x < sw; x++) {
        if (data[(y * sw + x) * 4 + 3] > 40) {
          if (min < 0) min = x;
          max = x;
        }
      }
      rows.push(min < 0 ? null : { x0: min / sw, x1: (max + 1) / sw });
    }
  }

  function layout() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.clientWidth;
    ch = canvas.clientHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    var i = Math.min(rows.length - 1, Math.floor((f - BAND_START) / (1 - BAND_START) * rows.length));
    var r = rows[i];
    if (!r) return null;
    var size = 0.5 + Math.random() * Math.random() * 1.7;
    return {
      x: box.x + (r.x0 + Math.random() * (r.x1 - r.x0)) * box.w,
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

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    var now = ts / 1000;
    if (!t0) t0 = now;
    var dt = last ? Math.min(now - last, 0.05) : 0;
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
    if (run && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
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
    sampleSilhouette();
    if (!rows) return;

    canvas.className = 'hero-dust';
    canvas.setAttribute('aria-hidden', 'true');
    hero.appendChild(canvas);
    relayout();

    var pending = 0;
    function onResize() {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(relayout);
    }
    var scrolling = 0;
    function onScroll() {
      if (scrolling) return;
      scrolling = requestAnimationFrame(function () {
        scrolling = 0;
        checkVisible();
      });
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    /* the portrait's height eases when the breakpoint flips — measure again once it settles */
    img.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'height') onResize();
    });
    document.addEventListener('visibilitychange', sync);
  }

  if (img.complete && img.naturalWidth) init();
  else img.addEventListener('load', init);
})();
