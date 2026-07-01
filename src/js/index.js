import { initAos, initSharedUi } from './runtime.js';

function initTyped() {
  const typedElement = document.querySelector('.typed');

  if (!typedElement || !window.Typed) {
    return;
  }

  const strings = typedElement
    .getAttribute('data-typed-items')
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!strings?.length) {
    return;
  }

  new window.Typed('.typed', {
    strings,
    loop: true,
    typeSpeed: 100,
    backSpeed: 50,
    backDelay: 2000
  });
}

function initPureCounter() {
  if (!window.PureCounter || !document.querySelector('.purecounter')) {
    return;
  }

  new window.PureCounter();
}

function initSkillsAnimation() {
  const groups = document.querySelectorAll('.skills-animation');

  if (!groups.length) {
    return;
  }

  const revealGroup = (group) => {
    group.querySelectorAll('.progress .progress-bar').forEach((bar) => {
      bar.style.width = `${bar.getAttribute('aria-valuenow')}%`;
    });
  };

  if (!('IntersectionObserver' in window)) {
    groups.forEach(revealGroup);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      revealGroup(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -20% 0px'
  });

  groups.forEach((group) => observer.observe(group));
}

function initGlightbox() {
  if (!window.GLightbox || !document.querySelector('.glightbox')) {
    return;
  }

  window.GLightbox({
    selector: '.glightbox'
  });
}

function initIsotope() {
  if (!window.imagesLoaded || !window.Isotope) {
    return;
  }

  document.querySelectorAll('.isotope-layout').forEach((isotopeItem) => {
    const container = isotopeItem.querySelector('.isotope-container');

    if (!container) {
      return;
    }

    const layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    const filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    const sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';
    let instance;

    window.imagesLoaded(container, () => {
      instance = new window.Isotope(container, {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach((filterItem) => {
      filterItem.addEventListener('click', () => {
        isotopeItem.querySelector('.isotope-filters .filter-active')?.classList.remove('filter-active');
        filterItem.classList.add('filter-active');
        instance?.arrange({
          filter: filterItem.getAttribute('data-filter')
        });
      });
    });
  });
}

function initHeroGlow() {
  const button = document.querySelector('.hero-glow-btn');

  if (!button) {
    return;
  }

  button.addEventListener('pointermove', (event) => {
    const rect = button.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = event.clientX - rect.left - cx;
    const dy = event.clientY - rect.top - cy;
    let kx = Number.POSITIVE_INFINITY;
    let ky = Number.POSITIVE_INFINITY;

    if (dx !== 0) {
      kx = cx / Math.abs(dx);
    }

    if (dy !== 0) {
      ky = cy / Math.abs(dy);
    }

    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    let degrees = 0;

    if (dx !== 0 || dy !== 0) {
      degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (degrees < 0) {
        degrees += 360;
      }
    }

    button.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
    button.style.setProperty('--cursor-angle', `${degrees.toFixed(3)}deg`);
  });
}

function initVisibilityTitle() {
  const originalTitle = document.title;

  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'Come back, we miss you!' : originalTitle;
  });
}

initSharedUi();
initAos();
initTyped();
initPureCounter();
initSkillsAnimation();
initGlightbox();
initIsotope();
initHeroGlow();
initVisibilityTitle();
