function onWindowLoad(callback) {
  if (document.readyState === 'complete') {
    callback();
    return;
  }

  window.addEventListener('load', callback, { once: true });
}

function onScroll(callback) {
  document.addEventListener('scroll', callback, { passive: true });
}

export function initHeaderToggle() {
  const header = document.querySelector('#header');
  const toggleButton = document.querySelector('.header-toggle');

  if (!header || !toggleButton) {
    return;
  }

  const toggleHeader = () => {
    header.classList.toggle('header-show');
    toggleButton.classList.toggle('bi-list');
    toggleButton.classList.toggle('bi-x');
  };

  toggleButton.addEventListener('click', toggleHeader);

  document.querySelectorAll('#navmenu a').forEach((link) => {
    link.addEventListener('click', () => {
      if (header.classList.contains('header-show')) {
        toggleHeader();
      }
    });
  });

  document.querySelectorAll('.navmenu .toggle-dropdown').forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      toggle.parentNode.classList.toggle('active');
      toggle.parentNode.nextElementSibling?.classList.toggle('dropdown-active');
      event.stopImmediatePropagation();
    });
  });
}

export function initPreloader() {
  const preloader = document.querySelector('#preloader');

  if (!preloader) {
    return;
  }

  onWindowLoad(() => {
    preloader.remove();
  });
}

export function initScrollTop() {
  const scrollTop = document.querySelector('.scroll-top');

  if (!scrollTop) {
    return;
  }

  const toggleScrollTop = () => {
    scrollTop.classList.toggle('active', window.scrollY > 100);
  };

  scrollTop.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  onWindowLoad(toggleScrollTop);
  onScroll(toggleScrollTop);
}

export function initHashScrollCorrection() {
  onWindowLoad(() => {
    if (!window.location.hash) {
      return;
    }

    const section = document.querySelector(window.location.hash);

    if (!section) {
      return;
    }

    setTimeout(() => {
      const scrollMarginTop = getComputedStyle(section).scrollMarginTop;
      window.scrollTo({
        top: section.offsetTop - parseInt(scrollMarginTop || '0', 10),
        behavior: 'smooth'
      });
    }, 100);
  });
}

export function initScrollSpy() {
  const navLinks = [...document.querySelectorAll('.navmenu a')];

  if (!navLinks.length) {
    return;
  }

  const updateScrollSpy = () => {
    navLinks.forEach((link) => {
      if (!link.hash) {
        return;
      }

      const section = document.querySelector(link.hash);

      if (!section) {
        link.classList.remove('active');
        return;
      }

      const position = window.scrollY + 200;
      const inView = position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight;

      if (inView) {
        document.querySelectorAll('.navmenu a.active').forEach((activeLink) => {
          activeLink.classList.remove('active');
        });
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  onWindowLoad(updateScrollSpy);
  onScroll(updateScrollSpy);
}

export function initAos() {
  if (!window.AOS) {
    return;
  }

  const start = () => {
    window.AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  };

  onWindowLoad(start);
}

export function initSharedUi() {
  initHeaderToggle();
  initPreloader();
  initScrollTop();
  initHashScrollCorrection();
  initScrollSpy();
}
