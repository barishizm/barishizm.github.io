import { initAos, initSharedUi } from './runtime.js';

function initSwiper() {
  if (!window.Swiper) {
    return;
  }

  document.querySelectorAll('.init-swiper').forEach((swiperElement) => {
    const configNode = swiperElement.querySelector('.swiper-config');

    if (!configNode) {
      return;
    }

    const config = JSON.parse(configNode.textContent.trim());
    new window.Swiper(swiperElement, config);
  });
}

initSharedUi();
initAos();
initSwiper();
