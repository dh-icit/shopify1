const button = document.querySelector('.wt-cart__cross-sell__toggle');

button.addEventListener('click', () => {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  button.closest('.wt-cart__cross-sell').classList.toggle('wt-cart__cross-sell--collapsed')
  button.setAttribute('aria-expanded', !isExpanded);
});