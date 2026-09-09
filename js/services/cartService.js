import { renderCartDrawer } from '../ui/renderService.js';

// Estado privado del carrito
let cart = [];
const DELIVERY_FEE = 4000;

/**
 * Obtiene la lista actual de ítems en el carrito.
 */
export function getCart() {
  return cart;
}

/**
 * Normaliza arreglos para la comparación segura de arreglos ordenados
 */
function normalizeArray(arr) {
  return Array.isArray(arr) ? [...arr].sort() : [];
}

/**
 * Agrega un nuevo ítem personalizado al carrito o incrementa si coincide exactamente.
 */
export function addToCart(item) {
  // Asegurar que unitPrice exista y sea un número válido
  const price = parseInt(item.unitPrice || item.price || item.priceSolo || 0, 10);
  const normalizedItem = {
    ...item,
    unitPrice: price,
    quantity: item.quantity || 1,
    selectedVeggies: item.selectedVeggies || [],
    selectedSauces: item.selectedSauces || [],
    selectedAdditionals: item.selectedAdditionals || [],
    notes: item.notes || ''
  };

  // Verificar si existe un ítem idéntico (mismo ID y mismos opcionales)
  const existingIndex = cart.findIndex(cartItem => 
    cartItem.id === normalizedItem.id &&
    cartItem.isCombo === normalizedItem.isCombo &&
    cartItem.selectedDrink === normalizedItem.selectedDrink &&
    cartItem.selectedProtein === normalizedItem.selectedProtein &&
    JSON.stringify(normalizeArray(cartItem.selectedVeggies)) === JSON.stringify(normalizeArray(normalizedItem.selectedVeggies)) &&
    JSON.stringify(normalizeArray(cartItem.selectedSauces)) === JSON.stringify(normalizeArray(normalizedItem.selectedSauces)) &&
    JSON.stringify(normalizeArray(cartItem.selectedAdditionals)) === JSON.stringify(normalizeArray(normalizedItem.selectedAdditionals)) &&
    cartItem.notes === normalizedItem.notes
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += normalizedItem.quantity;
  } else {
    cart.push({
      cartItemId: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      ...normalizedItem
    });
  }

  notifyCartUpdate();
}

/**
 * Remueve un producto del carrito según su identificador único dentro del arreglo.
 */
export function removeFromCart(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  notifyCartUpdate();
}

/**
 * Actualiza la cantidad de un ítem en el carrito.
 */
export function updateQuantity(cartItemId, delta) {
  const item = cart.find(i => i.cartItemId === cartItemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(cartItemId);
  } else {
    notifyCartUpdate();
  }
}

/**
 * Vacía completamente el carrito.
 */
export function clearCart() {
  cart = [];
  notifyCartUpdate();
}

/**
 * Calcula subtotal, costo de envío y total acumulado.
 */
export function getCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + ((item.unitPrice || 0) * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  return { subtotal, deliveryFee, total };
}

/**
 * Notifica a la interfaz UI para que renderice los cambios.
 */
function notifyCartUpdate() {
  if (typeof renderCartDrawer === 'function') {
    renderCartDrawer();
  }
}