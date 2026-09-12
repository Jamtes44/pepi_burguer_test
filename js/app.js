import { renderCategories, renderProducts, renderCartDrawer } from './ui/renderService.js';
import { subscribeToProducts, subscribeToStoreStatus } from './services/firebaseService.js';
import { getCart, getCartTotals, addToCart } from './services/cartService.js';

const PEPI_PHONE_NUMBER = "3153344045"; 

let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderCartDrawer();

  subscribeToProducts((products) => {
    window.latestProductsList = products;
    renderProducts(products);
  });

  subscribeToStoreStatus((isOpen) => {
    updateClientStoreStatusUI(isOpen);
  });

  // Controles del Drawer
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const openCartBtn = document.getElementById('open-cart-btn');
  const floatCartBtn = document.getElementById('float-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');

  const toggleCart = (show) => {
    if (show) {
      cartBackdrop?.classList.remove('hidden');
      cartDrawer?.classList.remove('translate-x-full');
    } else {
      cartBackdrop?.classList.add('hidden');
      cartDrawer?.classList.add('translate-x-full');
    }
  };

  if (openCartBtn) openCartBtn.addEventListener('click', () => toggleCart(true));
  if (floatCartBtn) floatCartBtn.addEventListener('click', () => toggleCart(true));
  if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
  if (cartBackdrop) cartBackdrop.addEventListener('click', () => toggleCart(false));

  // Control de Ubicación de Domicilio
  const locationRadios = document.querySelectorAll('input[name="delivery-location"]');
  locationRadios.forEach(radio => {
    radio.addEventListener('change', handleDeliveryLocationChange);
  });

  // Método global para abrir el Modal Personalizador
  window.openCustomizer = (productId) => {
    const product = (window.latestProductsList || []).find(p => p.id === productId);
    if (!product) return;

    currentProduct = product;
    const categoryLower = (product.category || '').toLowerCase();

    // Adicionales y Bebidas se agregan DIRECTAMENTE sin modal
    if (categoryLower === 'adicionales' || categoryLower === 'bebidas') {
      const directItem = {
        id: product.id,
        name: product.name,
        unitPrice: parseInt(product.priceSolo, 10) || 0,
        isCombo: false,
        presentation: 'Solo / Individual',
        protein: null,
        selectedVeggies: [],
        selectedSauces: [],
        selectedAdditionals: [],
        notes: '',
        image: product.image
      };
      addToCart(directItem);
      toggleCart(true); // Abrir canasta tras agregar
      return;
    }

    // Para Hamburguesas, Perros, Salchipapas, Burritos -> Abrir Modal
    document.getElementById('modal-product-category').textContent = product.category || 'Categoría';
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-notes').value = '';

    const presContainer = document.getElementById('presentation-options-container');
    const presSection = document.getElementById('modal-section-presentation');

    if (product.priceCombo) {
      presSection?.classList.remove('hidden');
      if (presContainer) {
        // Texto específico según la categoría (Ej: Salchipapas sólo +Bebida)
        const comboText = categoryLower === 'salchipapas' 
          ? '🍟 En Combo (+Bebida)' 
          : '🍟 En Combo (+Papas +Bebida)';

        presContainer.innerHTML = `
          <label class="flex flex-col p-2.5 rounded-xl border border-gray-200 bg-white has-[:checked]:border-brand-red has-[:checked]:bg-red-50/50 cursor-pointer">
            <div class="flex items-center gap-1.5 mb-1">
              <input type="radio" name="modal-presentation" value="Solo" checked class="text-brand-red focus:ring-brand-red">
              <span class="font-black text-xs">🍔 Solo / Individual</span>
            </div>
            <span class="text-xs text-brand-dark font-black pl-5">$${parseInt(product.priceSolo, 10).toLocaleString('es-CO')}</span>
          </label>

          <label class="flex flex-col p-2.5 rounded-xl border border-gray-200 bg-white has-[:checked]:border-brand-red has-[:checked]:bg-red-50/50 cursor-pointer">
            <div class="flex items-center gap-1.5 mb-1">
              <input type="radio" name="modal-presentation" value="Combo" class="text-brand-red focus:ring-brand-red">
              <span class="font-black text-xs">${comboText}</span>
            </div>
            <span class="text-xs text-brand-dark font-black pl-5">$${parseInt(product.priceCombo, 10).toLocaleString('es-CO')}</span>
          </label>
        `;
      }
    } else {
      presSection?.classList.add('hidden');
    }

    updateModalOptionsVisibility();
    updateModalPriceDisplay();

    document.querySelectorAll('input[name="modal-presentation"], input[name="modal-addons"]').forEach(element => {
      element.addEventListener('change', () => {
        updateModalOptionsVisibility();
        updateModalPriceDisplay();
      });
    });

    document.getElementById('customize-modal')?.classList.remove('hidden');
  };

  const confirmAddBtn = document.getElementById('confirm-add-cart-btn');
  if (confirmAddBtn) {
    confirmAddBtn.addEventListener('click', handleConfirmAddToCart);
  }

  const closeModalBtn = document.getElementById('close-modal-btn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('customize-modal')?.classList.add('hidden');
    });
  }

  const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');
  if (sendWhatsappBtn) {
    sendWhatsappBtn.addEventListener('click', submitOrderViaWhatsApp);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleCart(false);
      document.getElementById('customize-modal')?.classList.add('hidden');
    }
  });
});

/**
 * Llena el selector de bebidas en el combo directamente con los productos de la categoría Bebidas
 */
function updateModalOptionsVisibility() {
  if (!currentProduct) return;

  const selectedPresentation = document.querySelector('input[name="modal-presentation"]:checked')?.value || 'Solo';
  const isCombo = selectedPresentation === 'Combo';

  const drinkSection = document.getElementById('modal-section-drink');
  const drinkSelect = document.getElementById('modal-drink-select');

  if (isCombo && drinkSection && drinkSelect) {
    drinkSection.classList.remove('hidden');

    // Cargar bebidas dinámicamente desde el inventario de la tienda
    const availableDrinks = (window.latestProductsList || [])
      .filter(p => (p.category || '').toLowerCase() === 'bebidas' && p.isAvailable !== false);

    if (availableDrinks.length > 0) {
      drinkSelect.innerHTML = availableDrinks.map(drink => `
        <option value="${drink.name}">🥤 ${drink.name}</option>
      `).join('');
    } else {
      drinkSelect.innerHTML = `
        <option value="Gaseosa Personal">🥤 Gaseosa Personal</option>
        <option value="Jugo Hit">🧃 Jugo Hit</option>
        <option value="Agua Mineral">💧 Agua Mineral</option>
      `;
    }
  } else if (drinkSection) {
    drinkSection.classList.add('hidden');
  }
}

function handleDeliveryLocationChange() {
  const selectedLocation = document.querySelector('input[name="delivery-location"]:checked')?.value;
  const reservaContainer = document.getElementById('reserva-fields-container');
  const otherContainer = document.getElementById('other-address-container');

  if (selectedLocation === 'Reserva de Fontibón') {
    reservaContainer?.classList.remove('hidden');
    otherContainer?.classList.add('hidden');
  } else {
    reservaContainer?.classList.add('hidden');
    otherContainer?.classList.remove('hidden');
  }

  renderCartDrawer();
}

function updateModalPriceDisplay() {
  if (!currentProduct) return;

  const selectedPresentation = document.querySelector('input[name="modal-presentation"]:checked')?.value || 'Solo';
  const isCombo = selectedPresentation === 'Combo';
  
  const basePrice = isCombo && currentProduct.priceCombo 
    ? parseInt(currentProduct.priceCombo, 10) 
    : parseInt(currentProduct.priceSolo, 10);

  let extraCost = 0;
  document.querySelectorAll('input[name="modal-addons"]:checked').forEach(addon => {
    extraCost += parseInt(addon.dataset.price || 0, 10);
  });

  const total = basePrice + extraCost;
  const priceDisplay = document.getElementById('modal-price-display');
  if (priceDisplay) {
    priceDisplay.textContent = `$${total.toLocaleString('es-CO')}`;
  }
}

function handleConfirmAddToCart() {
  if (!currentProduct) return;

  const categoryLower = (currentProduct.category || '').toLowerCase();
  const selectedPresentation = document.querySelector('input[name="modal-presentation"]:checked')?.value || 'Solo';
  const isCombo = selectedPresentation === 'Combo';
  
  const basePrice = isCombo && currentProduct.priceCombo 
    ? parseInt(currentProduct.priceCombo, 10) 
    : parseInt(currentProduct.priceSolo, 10);

  const selectedProtein = document.querySelector('input[name="modal-protein"]:checked')?.value || 'Carne Res';

  const selectedVeggies = Array.from(document.querySelectorAll('input[name="modal-veggies"]:checked'))
    .map(chk => chk.value);

  const selectedSauces = Array.from(document.querySelectorAll('input[name="modal-sauces"]:checked'))
    .map(chk => chk.value);

  let extraCost = 0;
  const selectedAdditionals = Array.from(document.querySelectorAll('input[name="modal-addons"]:checked'))
    .map(chk => {
      extraCost += parseInt(chk.dataset.price || 0, 10);
      return chk.value;
    });

  const drinkSelect = document.getElementById('modal-drink-select');
  const selectedDrink = isCombo && drinkSelect ? drinkSelect.value : null;

  const notes = document.getElementById('modal-notes')?.value.trim() || '';
  const unitPrice = basePrice + extraCost;

  let presentationLabel = 'Solo / Individual';
  if (isCombo) {
    presentationLabel = categoryLower === 'salchipapas' 
      ? `Combo (+${selectedDrink || 'Bebida'})` 
      : `Combo (+Papas +${selectedDrink || 'Bebida'})`;
  }

  const itemToAdd = {
    id: currentProduct.id,
    name: currentProduct.name,
    unitPrice: unitPrice,
    isCombo: isCombo,
    presentation: presentationLabel,
    protein: selectedProtein,
    selectedVeggies: selectedVeggies,
    selectedSauces: selectedSauces,
    selectedAdditionals: selectedAdditionals,
    notes: notes,
    image: currentProduct.image
  };

  addToCart(itemToAdd);
  document.getElementById('customize-modal')?.classList.add('hidden');
}

function updateClientStoreStatusUI(isOpen) {
  const statusContainer = document.getElementById('store-status-pill');
  const sendOrderBtn = document.getElementById('send-whatsapp-btn');

  if (statusContainer) {
    if (isOpen) {
      statusContainer.className = "bg-amber-500/10 border-t border-brand-cheddar/20 py-1 px-4 text-center";
      statusContainer.innerHTML = `
        <p class="text-[11px] font-medium text-amber-900 flex items-center justify-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span class="font-bold text-emerald-700">Abierto hoy</span> • Domicilios rápidos &amp; calientes
        </p>
      `;
    } else {
      statusContainer.className = "bg-red-500/10 border-t border-red-500/20 py-1 px-4 text-center";
      statusContainer.innerHTML = `
        <p class="text-[11px] font-medium text-red-900 flex items-center justify-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-red-500"></span>
          <span class="font-bold text-red-600">Cerrado por hoy</span> • No estamos recibiendo pedidos en este momento
        </p>
      `;
    }
  }

  if (sendOrderBtn) {
    if (isOpen) {
      sendOrderBtn.disabled = false;
      sendOrderBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
      sendOrderBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
      sendOrderBtn.innerHTML = `<span>📲 Confirmar Pedido por WhatsApp</span>`;
    } else {
      sendOrderBtn.disabled = true;
      sendOrderBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
      sendOrderBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
      sendOrderBtn.innerHTML = `<span>🔒 Local Cerrado Temporalmente</span>`;
    }
  }
}

function submitOrderViaWhatsApp() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Por favor selecciona algún producto antes de confirmar tu pedido.");
    return;
  }

  const name = document.getElementById('order-name')?.value.trim();
  const phone = document.getElementById('order-phone')?.value.trim();
  const payment = document.getElementById('order-payment')?.value;
  const selectedLocation = document.querySelector('input[name="delivery-location"]:checked')?.value;

  if (!name || !phone) {
    alert("Por favor ingresa tu Nombre y Teléfono.");
    return;
  }

  let locationText = '';
  let isFreeDelivery = selectedLocation === 'Reserva de Fontibón';

  if (isFreeDelivery) {
    const tower = document.getElementById('order-tower')?.value.trim();
    const apartment = document.getElementById('order-apartment')?.value.trim();

    if (!tower || !apartment) {
      alert("Por favor ingresa tu Torre y Apartamento para la entrega en Reserva de Fontibón.");
      return;
    }
    locationText = `🏢 *Conjunto:* Reserva de Fontibón\n🏢 *Torre:* ${tower}\n🚪 *Apto/Interior:* ${apartment}`;
  } else {
    const address = document.getElementById('order-address')?.value.trim();
    if (!address) {
      alert("Por favor ingresa tu Dirección completa.");
      return;
    }
    locationText = `📍 *Dirección:* ${address}`;
  }

  const { subtotal } = getCartTotals();

  let msg = `¡Hola *Pepi Burguer*! 👋 Quiero confirmar este pedido con Sabor Premium:\n\n`;
  msg += `👤 *Cliente:* ${name}\n`;
  msg += `📞 *Tel:* ${phone}\n`;
  msg += `${locationText}\n`;
  msg += `💳 *Método de Pago:* ${payment}\n\n`;

  msg += `🛒 *DETALLE DEL PEDIDO:*\n`;
  cart.forEach((item, idx) => {
    msg += `\n*${idx + 1}. ${item.name}* (x${item.quantity})\n`;
    if (item.presentation) msg += `   - Presentación: ${item.presentation}\n`;
    if (item.protein) msg += `   - Proteína: ${item.protein}\n`;
    if (item.selectedAdditionals?.length > 0) msg += `   - Extras: ${item.selectedAdditionals.join(', ')}\n`;
    if (item.notes) msg += `   - Nota: _${item.notes}_\n`;
    msg += `   - Subtotal: $${(item.unitPrice * item.quantity).toLocaleString('es-CO')}\n`;
  });

  msg += `\n-----------------------------\n`;
  msg += `🧾 *Subtotal:* $${subtotal.toLocaleString('es-CO')}\n`;
  msg += `🛵 *Domicilio:* ${isFreeDelivery ? '¡GRATIS! (Reserva de Fontibón)' : 'A calcular'}\n`;
  msg += `💰 *TOTAL PRODUCTOS:* $${subtotal.toLocaleString('es-CO')} ${!isFreeDelivery ? '(+ valor domicilio)' : ''}\n`;
  msg += `-----------------------------\n`;
  msg += `¿Me confirman el costo final y el tiempo estimado de entrega por favor? ¡Muchas gracias! 🙌`;

  const cleanNumber = PEPI_PHONE_NUMBER.replace(/\D/g, '');
  const formattedPhone = cleanNumber.startsWith('57') ? cleanNumber : `57${cleanNumber}`;

  const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}