import { getCart, getCartTotals } from './cartService.js';
import { formatCurrency } from '../utils/formatters.js';

const WHATSAPP_PHONE = '3025277150';

/**
 * Recopila los datos del formulario, procesa la lista del carrito y abre WhatsApp.
 */
export function sendOrderToWhatsApp() {
  const cart = getCart();

  if (cart.length === 0) {
    alert('Tu carrito está vacío. Agrega productos antes de realizar el pedido.');
    return;
  }

  // Capturar campos del cliente
  const nameInput = document.getElementById('customer-name');
  const addressInput = document.getElementById('customer-address');
  const paymentSelect = document.getElementById('payment-method');

  const name = nameInput ? nameInput.value.trim() : '';
  const address = addressInput ? addressInput.value.trim() : '';
  const paymentMethod = paymentSelect ? paymentSelect.value : '';

  // Validaciones de campos obligatorios
  if (!name) {
    alert('Por favor, ingresa tu nombre completo.');
    nameInput?.focus();
    return;
  }

  if (!address) {
    alert('Por favor, ingresa la dirección de entrega y barrio.');
    addressInput?.focus();
    return;
  }

  if (!paymentMethod) {
    alert('Por favor, selecciona un método de pago.');
    paymentSelect?.focus();
    return;
  }

  const { subtotal, deliveryFee, total } = getCartTotals();

  // Construcción del mensaje en formato Markdown para WhatsApp
  let message = `🍔 *¡NUEVO PEDIDO - PEPI BURGUER!* 🍔\n`;
  message += `-----------------------------------\n`;
  message += `👤 *Cliente:* ${name}\n`;
  message += `📍 *Dirección:* ${address}\n`;
  message += `💳 *Método de Pago:* ${paymentMethod}\n`;
  message += `-----------------------------------\n\n`;
  message += `🛒 *DETALLE DEL PEDIDO:*\n\n`;

  cart.forEach((item, index) => {
    const itemTotal = item.unitPrice * item.quantity;
    const presentation = item.isCombo ? 'COMBO (papas + bebida)' : 'SOLO';
    
    message += `*${index + 1}. ${item.name}* x${item.quantity}\n`;
    message += `   • *Presentación:* ${presentation}\n`;

    if (item.isCombo && item.selectedDrink) {
      message += `   • *Bebida:* ${item.selectedDrink}\n`;
    }

    if (item.selectedProtein) {
      message += `   • *Proteína:* ${item.selectedProtein}\n`;
    }

    if (item.selectedVeggies && item.selectedVeggies.length > 0) {
      message += `   • *Vegetales:* ${item.selectedVeggies.join(', ')}\n`;
    }

    if (item.selectedSauces && item.selectedSauces.length > 0) {
      message += `   • *Salsas:* ${item.selectedSauces.join(', ')}\n`;
    }

    if (item.selectedAdditionals && item.selectedAdditionals.length > 0) {
      message += `   • *Adicionales:* ${item.selectedAdditionals.join(', ')}\n`;
    }

    if (item.notes) {
      message += `   • *Notas:* _${item.notes}_\n`;
    }

    message += `   • *Subtotal:* ${formatCurrency(itemTotal)}\n\n`;
  });

  message += `-----------------------------------\n`;
  message += `💰 *Subtotal:* ${formatCurrency(subtotal)}\n`;
  message += `🛵 *Domicilio:* ${formatCurrency(deliveryFee)}\n`;
  message += `🔥 *TOTAL A PAGAR:* ${formatCurrency(total)}\n`;
  message += `-----------------------------------\n`;
  message += `¡Quedo a la espera de la confirmación!`;

  // Codificar URL y redirigir
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
}