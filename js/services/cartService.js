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
 * Agrega un nuevo ítem personalizado al carrito o incrementa si coincide exactamente.
 */
export function addToCart(item) {
  // Verificar si existe un ítem idéntico (mismo ID y mismos opcionales)
  const existingIndex = cart.findIndex(cartItem => 
    cartItem.id === item.id &&
    cartItem.isCombo === item.isCombo &&
    cartItem.selectedDrink === item.selectedDrink &&
    cartItem.selectedProtein === item.selectedProtein &&
    JSON.stringify(cartItem.selectedVeggies?.sort()) === JSON.stringify(item.selectedVeggies?.sort()) &&
    JSON.stringify(cartItem.selectedSauces?.sort()) === JSON.stringify(item.selectedSauces?.sort()) &&
    JSON.stringify(cartItem.selectedAdditionals?.sort()) === JSON.stringify(item.selectedAdditionals?.sort()) &&
    cartItem.notes === item.notes
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += item.quantity || 1;
  } else {
    cart.push({
      cartItemId: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      ...item,
      quantity: item.quantity || 1
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
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  return { subtotal, deliveryFee, total };
}

/**
 * Notifica a la interfaz UI para que renderice los cambios.
 */
function notifyCartUpdate() {
  renderCartDrawer();
}