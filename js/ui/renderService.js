import { getCart, getCartTotals, removeFromCart, updateQuantity } from '../services/cartService.js';

let activeCategory = 'all';

function formatCOP(amount) {
  return '$' + (amount || 0).toLocaleString('es-CO');
}

export function renderCategories() {
  const navContainer = document.querySelector('nav[data-purpose="category-tabs"] > div');
  if (!navContainer) return;

  const categories = [
    { id: 'all', name: '✨ Todos' },
    { id: 'hamburguesas', name: '🍔 Hamburguesas' },
    { id: 'salchipapas', name: '🍟 Salchipapas' },
    { id: 'perros', name: '🌭 Perros Calientes' },
    { id: 'burritos', name: '🌯 Burritos' },
    { id: 'adicionales', name: '🥓 Adicionales' },
    { id: 'bebidas', name: '🥤 Bebidas' }
  ];

  navContainer.innerHTML = categories.map(cat => {
    const isActive = cat.id === activeCategory;
    const activeClasses = isActive 
      ? "bg-brand-red text-white" 
      : "bg-white text-brand-dark border border-gray-200";

    return `
      <button class="cat-pill px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm ${activeClasses}" data-category="${cat.id}">
        ${cat.name}
      </button>
    `;
  }).join('');

  navContainer.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeCategory = e.currentTarget.dataset.category;
      renderCategories();
      renderProducts(window.latestProductsList || []);
    });
  });
}

export function renderProducts(productsList = []) {
  const catalog = document.getElementById('products-catalog');
  if (!catalog) return;

  window.latestProductsList = productsList;

  const availableProducts = productsList.filter(p => p.isAvailable !== false);

  const items = activeCategory === 'all' 
    ? availableProducts 
    : availableProducts.filter(p => (p.category || 'hamburguesas').toLowerCase() === activeCategory);

  catalog.innerHTML = '';

  if (items.length === 0) {
    catalog.innerHTML = `
      <div class="w-full text-center py-10 text-gray-400 text-xs italic font-medium">
        No hay productos disponibles en esta categoría por el momento.
      </div>
    `;
    return;
  }

  items.forEach(product => {
    const card = document.createElement('article');
    card.className = "bg-white rounded-3xl p-4 shadow-soft border border-gray-100/80 flex flex-col justify-between transition hover:border-brand-orange/30 overflow-hidden";

    const badgeHtml = product.badge 
      ? `<span class="bg-amber-100 text-amber-900 border border-amber-300/60 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">${product.badge}</span>` 
      : '';

    const imageUrl = product.image && product.image.trim() !== '' 
      ? product.image 
      : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1000';

    const imageHtml = `
      <div class="relative w-full h-40 -mt-4 -mx-4 mb-3 overflow-hidden bg-gray-100 rounded-t-3xl border-b border-gray-100">
        <img 
          src="${imageUrl}" 
          alt="${product.name}" 
          class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1000';"
        />
      </div>
    `;

    const categoryLower = (product.category || '').toLowerCase();
    const isDirectAdd = categoryLower === 'adicionales' || categoryLower === 'bebidas';

    let priceHtml = '';
    const priceSoloNum = parseInt(product.priceSolo, 10) || 0;
    const priceComboNum = product.priceCombo ? parseInt(product.priceCombo, 10) : null;

    if (priceComboNum && !isDirectAdd) {
      priceHtml = `
        <div>
          <span class="text-xs text-gray-500 font-medium block">Sola: <b class="text-brand-dark">${formatCOP(priceSoloNum)}</b></span>
          <span class="text-xs font-black text-brand-red block">Combo: ${formatCOP(priceComboNum)}</span>
        </div>
      `;
    } else {
      priceHtml = `
        <div>
          <span class="text-sm font-black text-brand-red">${formatCOP(priceSoloNum)}</span>
        </div>
      `;
    }

    const buttonLabel = isDirectAdd ? 'Agregar +' : 'Personalizar +';

    card.innerHTML = `
      <div>
        ${imageHtml}
        <div class="flex items-center justify-between gap-2 mb-1">
          <h3 class="font-black text-base text-brand-dark tracking-tight leading-snug">${product.name}</h3>
          ${badgeHtml}
        </div>
        <p class="text-xs text-gray-500 font-normal line-clamp-2 leading-relaxed mb-3">${product.description || ''}</p>
      </div>
      <div class="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
        ${priceHtml}
        <button type="button" data-id="${product.id}" class="btn-open-customizer px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-orange text-white text-xs font-black tracking-wide shadow-sm active:scale-95 transition flex items-center gap-1">
          <span>${buttonLabel}</span>
        </button>
      </div>
    `;
    
    catalog.appendChild(card);
  });

  catalog.querySelectorAll('.btn-open-customizer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = e.currentTarget.dataset.id;
      if (window.openCustomizer) window.openCustomizer(prodId);
    });
  });
}

export function renderCartDrawer() {
  const cart = getCart();
  const { subtotal } = getCartTotals();

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const selectedLocationInput = document.querySelector('input[name="delivery-location"]:checked');
  const selectedLocation = selectedLocationInput ? selectedLocationInput.value : 'Reserva de Fontibón';
  const isFreeDelivery = selectedLocation === 'Reserva de Fontibón';

  const badgeCount = document.getElementById('cart-badge-count');
  const floatCount = document.getElementById('float-cart-count');
  const floatTotal = document.getElementById('float-cart-total');

  if (badgeCount) badgeCount.textContent = totalCount;
  if (floatCount) floatCount.textContent = totalCount;
  if (floatTotal) floatTotal.textContent = formatCOP(subtotal);

  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDelivery = document.getElementById('summary-delivery');
  const summaryTotal = document.getElementById('summary-total');

  if (summarySubtotal) summarySubtotal.textContent = formatCOP(subtotal);

  if (summaryDelivery) {
    if (totalCount === 0) {
      summaryDelivery.textContent = '$0';
      summaryDelivery.className = "font-bold text-brand-dark";
    } else if (isFreeDelivery) {
      summaryDelivery.textContent = '¡GRATIS!';
      summaryDelivery.className = "font-black text-emerald-600";
    } else {
      summaryDelivery.textContent = 'A calcular';
      summaryDelivery.className = "font-bold text-amber-600";
    }
  }

  if (summaryTotal) {
    summaryTotal.textContent = formatCOP(subtotal);
  }

  const floatBar = document.getElementById('floating-cart-bar');
  if (floatBar) {
    if (totalCount > 0) {
      floatBar.classList.remove('hidden', 'translate-y-full');
    } else {
      floatBar.classList.add('translate-y-full');
      setTimeout(() => floatBar.classList.add('hidden'), 300);
    }
  }

  const container = document.getElementById('cart-items-container');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-400 py-6 text-center italic">Tu canasta está vacía. ¡Agrega tus favoritos!</p>`;
    return;
  }

  container.innerHTML = '';
  cart.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = "bg-brand-cream/60 border border-brand-orange/15 rounded-2xl p-3 flex flex-col gap-2";

    const unitPrice = parseInt(item.unitPrice || item.price || 0, 10);

    let metaDetails = [];
    if (item.presentation) metaDetails.push(`Pres: ${item.presentation}`);
    if (item.protein) metaDetails.push(`Prot: ${item.protein}`);
    
    const extrasList = item.selectedAdditionals || item.addons;
    if (extrasList && extrasList.length > 0) {
      metaDetails.push(`Extras: ${extrasList.join(', ')}`);
    }
    if (item.notes) metaDetails.push(`Nota: "${item.notes}"`);

    itemEl.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <h4 class="font-black text-xs text-brand-dark leading-tight">${item.name}</h4>
          <p class="text-[10px] text-gray-500 mt-0.5">${metaDetails.join(' • ')}</p>
        </div>
        <button class="btn-cart-remove text-gray-400 hover:text-brand-red font-bold text-xs p-1 shrink-0" data-cart-id="${item.cartItemId}">
          🗑️
        </button>
      </div>

      <div class="flex items-center justify-between pt-1 border-t border-brand-orange/10">
        <span class="text-xs font-black text-brand-red">${formatCOP(unitPrice * item.quantity)}</span>
        <div class="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 px-1 py-0.5">
          <button class="btn-qty-minus w-5 h-5 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 rounded" data-cart-id="${item.cartItemId}">-</button>
          <span class="text-xs font-black px-1">${item.quantity}</span>
          <button class="btn-qty-plus w-5 h-5 flex items-center justify-center font-bold text-brand-red hover:bg-gray-100 rounded" data-cart-id="${item.cartItemId}">+</button>
        </div>
      </div>
    `;
    container.appendChild(itemEl);
  });

  container.querySelectorAll('.btn-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cartItemId = e.currentTarget.dataset.cartId;
      updateQuantity(cartItemId, -1);
    });
  });

  container.querySelectorAll('.btn-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cartItemId = e.currentTarget.dataset.cartId;
      updateQuantity(cartItemId, 1);
    });
  });

  container.querySelectorAll('.btn-cart-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cartItemId = e.currentTarget.dataset.cartId;
      removeFromCart(cartItemId);
    });
  });
}