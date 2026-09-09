import { PRODUCTS, CUSTOMIZER_OPTIONS } from '../data/products.js';
import { addToCart } from './cartService.js';
import { formatCurrency } from '../utils/formatters.js';

let currentProduct = null;
let currentIsCombo = false;

/**
 * Abre el modal de personalización cargando las opciones según el producto.
 */
export function openCustomizer(productId) {
  currentProduct = PRODUCTS.find(p => p.id === productId);
  if (!currentProduct) return;

  currentIsCombo = false;

  const modal = document.getElementById('customizer-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalBody = document.getElementById('modal-body');

  modalTitle.textContent = currentProduct.name;
  modalSubtitle.textContent = currentProduct.description;

  // Renderizar las secciones de personalización en el cuerpo del modal
  modalBody.innerHTML = buildCustomizerHTML(currentProduct);

  // Event Listeners dinámicos para recalcular precio al cambiar opciones
  setupCustomizerEventListeners();

  updateModalTotal();
  modal.classList.remove('hidden');
}

/**
 * Cierra el modal de personalización.
 */
export function closeCustomizer() {
  const modal = document.getElementById('customizer-modal');
  modal.classList.add('hidden');
  currentProduct = null;
}

/**
 * Genera la estructura HTML de las opciones configurables para el producto actual.
 */
function buildCustomizerHTML(product) {
  let html = '';

  // 1. Selector Solo / Combo (si el producto aplica)
  if (product.priceCombo !== null) {
    html += `
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase text-stone-400">Presentación</label>
        <div class="grid grid-cols-2 gap-3">
          <label class="flex items-center justify-between p-3 rounded-xl border border-stone-700 bg-stone-900 cursor-pointer hover:border-brand-orange transition-colors">
            <div class="flex items-center gap-2">
              <input type="radio" name="modal-type" value="solo" checked class="w-4 h-4 text-brand-orange">
              <span class="text-sm font-semibold text-white">Solo</span>
            </div>
            <span class="text-xs font-bold text-stone-400">${formatCurrency(product.priceSolo)}</span>
          </label>
          <label class="flex items-center justify-between p-3 rounded-xl border border-stone-700 bg-stone-900 cursor-pointer hover:border-brand-orange transition-colors">
            <div class="flex items-center gap-2">
              <input type="radio" name="modal-type" value="combo" class="w-4 h-4 text-brand-orange">
              <span class="text-sm font-semibold text-white">Combo</span>
            </div>
            <span class="text-xs font-bold text-brand-cheddar">${formatCurrency(product.priceCombo)}</span>
          </label>
        </div>
        <p id="combo-hint" class="text-[11px] text-stone-500 hidden">* El combo incluye papas francesas individuales y gaseosa.</p>
      </div>
    `;
  }

  // 2. Selección de Bebida para Combo
  html += `
    <div id="drink-section" class="space-y-2 hidden">
      <label class="block text-xs font-bold uppercase text-stone-400">Elige tu Bebida</label>
      <select id="select-drink" class="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-orange">
        ${CUSTOMIZER_OPTIONS.drinks.map(drink => `<option value="${drink}">${drink}</option>`).join('')}
      </select>
    </div>
  `;

  // 3. Selección de Proteínas (para Salchipapas / Burritos)
  if (product.hasProteins) {
    html += `
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase text-stone-400">Proteína Principal</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${CUSTOMIZER_OPTIONS.proteins.map((prot, idx) => `
            <label class="flex items-center gap-2 p-2.5 rounded-lg border border-stone-800 bg-stone-900/60 cursor-pointer hover:bg-stone-800 text-sm text-stone-300">
              <input type="radio" name="modal-protein" value="${prot}" ${idx === 0 ? 'checked' : ''} class="w-4 h-4">
              <span>${prot}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 4. Vegetales (si aplica)
  if (product.hasVeggies) {
    html += `
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase text-stone-400">Vegetales (Desmarca para quitar)</label>
        <div class="grid grid-cols-2 gap-2">
          ${CUSTOMIZER_OPTIONS.veggies.map(veg => `
            <label class="flex items-center gap-2 p-2 rounded-lg bg-stone-900/40 text-sm text-stone-300 cursor-pointer hover:bg-stone-800">
              <input type="checkbox" name="modal-veggie" value="${veg}" checked class="w-4 h-4 rounded">
              <span>${veg}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 5. Salsas (si aplica)
  if (product.hasSauces) {
    html += `
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase text-stone-400">Salsas</label>
        <div class="grid grid-cols-2 gap-2">
          ${CUSTOMIZER_OPTIONS.sauces.map(sauce => `
            <label class="flex items-center gap-2 p-2 rounded-lg bg-stone-900/40 text-sm text-stone-300 cursor-pointer hover:bg-stone-800">
              <input type="checkbox" name="modal-sauce" value="${sauce}" checked class="w-4 h-4 rounded">
              <span>${sauce}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 6. Adicionales con costo extra
  html += `
    <div class="space-y-2">
      <label class="block text-xs font-bold uppercase text-stone-400">Adicionales</label>
      <div class="space-y-2">
        ${CUSTOMIZER_OPTIONS.additionals.map(add => `
          <label class="flex items-center justify-between p-2.5 rounded-xl border border-stone-800 bg-stone-900/50 cursor-pointer hover:border-stone-700 text-sm text-stone-300">
            <div class="flex items-center gap-2">
              <input type="checkbox" name="modal-additional" value="${add.id}" data-price="${add.price}" class="w-4 h-4 rounded">
              <span>${add.name}</span>
            </div>
            <span class="text-xs font-bold text-brand-cheddar">+${formatCurrency(add.price)}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;

  // 7. Notas adicionales
  html += `
    <div class="space-y-2">
      <label class="block text-xs font-bold uppercase text-stone-400">Notas para el pedido</label>
      <textarea id="modal-notes" rows="2" placeholder="Ej: Sin cebolla, pan bien tostado, salsa aparte..." class="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-brand-orange resize-none"></textarea>
    </div>
  `;

  return html;
}

/**
 * Escucha los cambios dentro del modal para actualizar precios y estado visual.
 */
function setupCustomizerEventListeners() {
  const typeRadios = document.querySelectorAll('input[name="modal-type"]');
  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentIsCombo = e.target.value === 'combo';
      
      const drinkSection = document.getElementById('drink-section');
      const comboHint = document.getElementById('combo-hint');

      if (drinkSection) drinkSection.classList.toggle('hidden', !currentIsCombo);
      if (comboHint) comboHint.classList.toggle('hidden', !currentIsCombo);

      updateModalTotal();
    });
  });

  const additionalCheckboxes = document.querySelectorAll('input[name="modal-additional"]');
  additionalCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateModalTotal);
  });
}

/**
 * Calcula y renderiza el valor total acumulado dentro del modal.
 */
function updateModalTotal() {
  if (!currentProduct) return;

  let total = currentIsCombo ? (currentProduct.priceCombo || currentProduct.priceSolo) : currentProduct.priceSolo;

  const selectedAdditionals = document.querySelectorAll('input[name="modal-additional"]:checked');
  selectedAdditionals.forEach(cb => {
    total += parseInt(cb.dataset.price, 10) || 0;
  });

  const modalTotalPrice = document.getElementById('modal-total-price');
  if (modalTotalPrice) {
    modalTotalPrice.textContent = formatCurrency(total);
  }
}

/**
 * Recopila la información configurada en el modal y la envía al carrito.
 */
export function confirmAddToCart() {
  if (!currentProduct) return;

  const selectedVeggies = Array.from(document.querySelectorAll('input[name="modal-veggie"]:checked')).map(cb => cb.value);
  const selectedSauces = Array.from(document.querySelectorAll('input[name="modal-sauce"]:checked')).map(cb => cb.value);
  
  const selectedAdditionals = Array.from(document.querySelectorAll('input[name="modal-additional"]:checked')).map(cb => {
    const addObj = CUSTOMIZER_OPTIONS.additionals.find(a => a.id === cb.value);
    return addObj ? addObj.name : cb.value;
  });

  const proteinRadio = document.querySelector('input[name="modal-protein"]:checked');
  const drinkSelect = document.getElementById('select-drink');
  const notesTextarea = document.getElementById('modal-notes');

  // Calcular precio unitario con adicionales
  let unitPrice = currentIsCombo ? (currentProduct.priceCombo || currentProduct.priceSolo) : currentProduct.priceSolo;
  document.querySelectorAll('input[name="modal-additional"]:checked').forEach(cb => {
    unitPrice += parseInt(cb.dataset.price, 10) || 0;
  });

  const itemPayload = {
    id: currentProduct.id,
    name: currentProduct.name,
    unitPrice: unitPrice,
    isCombo: currentIsCombo,
    selectedDrink: currentIsCombo && drinkSelect ? drinkSelect.value : null,
    selectedProtein: proteinRadio ? proteinRadio.value : null,
    selectedVeggies: selectedVeggies,
    selectedSauces: selectedSauces,
    selectedAdditionals: selectedAdditionals,
    notes: notesTextarea ? notesTextarea.value.trim() : ''
  };

  addToCart(itemPayload);
  closeCustomizer();
}
