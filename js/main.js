(function () {
  var root = document.documentElement;
  var KEY = 'site-lang';

  function setLang(lang) {
    root.setAttribute('lang', lang);
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  /* restore saved language (also done inline in <head> to avoid a flash) */
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'tr' || saved === 'en') root.setAttribute('lang', saved);
  } catch (e) {}

  var toggles = document.querySelectorAll('.lang-toggle');
  for (var i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener('click', function () {
      setLang(root.getAttribute('lang') === 'tr' ? 'en' : 'tr');
    });
  }

  var burger = document.querySelector('.hamburger');
  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  var navLinks = document.querySelectorAll('.nav a');
  for (var j = 0; j < navLinks.length; j++) {
    navLinks[j].addEventListener('click', function () {
      document.body.classList.remove('menu-open');
      if (burger) burger.setAttribute('aria-expanded', 'false');
    });
  }
})();

/* ===== PAGE TRANSITION LOADER (Uiverse.io by Nawsome) ===== */
(function () {
  var MIN_SHOW = 500; /* ms — animasyonun görünmesi için minimum süre */

  var overlay = document.createElement('div');
  overlay.className = 'page-loader';
  overlay.innerHTML =
    '<div aria-label="Orange and tan hamster running in a metal wheel" role="img" class="wheel-and-hamster">' +
      '<div class="wheel"></div>' +
      '<div class="hamster">' +
        '<div class="hamster__body">' +
          '<div class="hamster__head">' +
            '<div class="hamster__ear"></div>' +
            '<div class="hamster__eye"></div>' +
            '<div class="hamster__nose"></div>' +
          '</div>' +
          '<div class="hamster__limb hamster__limb--fr"></div>' +
          '<div class="hamster__limb hamster__limb--fl"></div>' +
          '<div class="hamster__limb hamster__limb--br"></div>' +
          '<div class="hamster__limb hamster__limb--bl"></div>' +
          '<div class="hamster__tail"></div>' +
        '</div>' +
      '</div>' +
      '<div class="spoke"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el || !el.href) return;

    if (el.target && el.target !== '_self') return;
    if (el.hasAttribute('download')) return;
    if (el.origin !== location.origin) return;

    var href = el.getAttribute('href') || '';
    if (href.charAt(0) === '#') return;
    if (/^(mailto:|tel:)/i.test(href)) return;
    /* aynı sayfa içi çapa linkleri */
    if (el.pathname === location.pathname && el.search === location.search && el.hash) return;

    e.preventDefault();
    overlay.classList.add('is-active');
    var dest = el.href;
    setTimeout(function () { location.href = dest; }, MIN_SHOW);
  });

  /* geri/ileri (bfcache) ile dönüldüğünde overlay'i kapat */
  window.addEventListener('pageshow', function () {
    overlay.classList.remove('is-active');
  });
})();
