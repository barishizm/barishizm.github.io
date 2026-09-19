(function () {
  /* Each language lives on its own URL (/… English, /tr/… Turkish), so the language
     switch is a plain link (see .lang-toggle) and nothing about it needs JS or storage. */
  var isTr = document.documentElement.getAttribute('lang') === 'tr';
  var L = isTr
    ? { open: 'Menüyü aç', close: 'Menüyü kapat', subject: 'barishizm.eu üzerinden mesaj' }
    : { open: 'Open menu', close: 'Close menu', subject: 'Message from barishizm.eu' };

  var burger = document.querySelector('.hamburger');
  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? L.close : L.open);
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
      if (!subject) subject = L.subject;
      var body = message + (name ? '\n\n— ' + name : '');
      window.location.href = 'mailto:barishizm@proton.me' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }
})();
