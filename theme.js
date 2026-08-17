document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const drawer = document.querySelector('[data-cart-drawer]');
  const body = document.querySelector('[data-cart-body]');

  const openCart = () => {
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    refreshCart();
  };

  const closeCart = () => {
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-cart-open]').forEach(button => {
    button.addEventListener('click', openCart);
  });

  document.querySelectorAll('[data-cart-close]').forEach(button => {
    button.addEventListener('click', closeCart);
  });

  async function refreshCart() {
    if (!body) return;
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();

      if (!cart.item_count) {
        body.innerHTML = '<p>Your bag is empty.</p>';
        return;
      }

      body.innerHTML = cart.items.map(item => `
        <div style="display:flex;gap:12px;margin-bottom:18px">
          <img src="${item.image}" alt="" width="70" height="90" style="object-fit:cover">
          <div>
            <strong>${item.product_title}</strong>
            <div>Qty: ${item.quantity}</div>
            <div>${Shopify.formatMoney(item.final_line_price)}</div>
          </div>
        </div>
      `).join('') + `
        <a class="button button--dark" href="/checkout">Checkout</a>
      `;
    } catch (error) {
      body.innerHTML = '<p>Unable to load your bag.</p>';
    }
  }

  document.querySelectorAll('[data-product-form]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();

      const formData = new FormData(form);
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (response.ok) {
        const cartResponse = await fetch('/cart.js');
        const cart = await cartResponse.json();
        document.querySelectorAll('[data-cart-count]').forEach(el => {
          el.textContent = cart.item_count;
        });
        openCart();
      }
    });
  });
});
