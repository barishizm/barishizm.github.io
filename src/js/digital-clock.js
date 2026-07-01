const hoursContainer = document.querySelector('.hours');
const minutesContainer = document.querySelector('.minutes');
const secondsContainer = document.querySelector('.seconds');

if (hoursContainer && minutesContainer && secondsContainer) {
  let lastRendered = '';

  function updateContainer(container, value) {
    const digits = value.padStart(2, '0').split('');
    const first = container.firstElementChild;
    const second = container.lastElementChild;

    if (first?.lastElementChild?.textContent !== digits[0]) {
      updateNumber(first, digits[0]);
    }

    if (second?.lastElementChild?.textContent !== digits[1]) {
      updateNumber(second, digits[1]);
    }
  }

  function updateNumber(element, digit) {
    const replacement = element.lastElementChild.cloneNode(true);
    replacement.textContent = digit;
    element.appendChild(replacement);
    element.classList.add('move');

    window.setTimeout(() => {
      element.classList.remove('move');
      element.firstElementChild?.remove();
    }, 990);
  }

  function renderTime() {
    const now = new Date();
    const timestamp = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');

    if (timestamp === lastRendered) {
      return;
    }

    lastRendered = timestamp;
    updateContainer(hoursContainer, timestamp.slice(0, 2));
    updateContainer(minutesContainer, timestamp.slice(3, 5));
    updateContainer(secondsContainer, timestamp.slice(6, 8));
  }

  renderTime();
  window.setInterval(renderTime, 1000);
}
