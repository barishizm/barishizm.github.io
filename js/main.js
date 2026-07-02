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

  /* contact form: build a mailto: link and open the visitor's e-mail app */
  var contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cf-name').value.trim();
      var subject = document.getElementById('cf-subject').value.trim();
      var message = document.getElementById('cf-message').value.trim();
      if (!subject) subject = 'Message from barishizm.eu';
      var body = message + (name ? '\n\n— ' + name : '');
      window.location.href = 'mailto:barishizm@proton.me' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }
})();
