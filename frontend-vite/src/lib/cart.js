import api from './axios';

const GUEST_KEY = 'guestCart';

export function loadGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    const parsed = raw ? JSON.parse(raw) : { items: [] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify({ items }));
}

export async function addToCart({ userId, productId, name, price, quantity = 1 }) {
  if (!productId) throw new Error('productId required');

  if (!userId) {
    // guest: store locally (include image when available)
    const items = loadGuestCart();
    const idx = items.findIndex((it) => it.productId === productId);
    if (idx >= 0) {
      items[idx].quantity = (Number(items[idx].quantity) || 0) + Number(quantity || 1);
    } else {
      items.push({ productId, name, price, quantity, image: arguments[0]?.image || '' });
    }
    saveGuestCart(items);
    // notify listeners in same window
    try { window.dispatchEvent(new CustomEvent('cart-updated', { detail: { source: 'guest', items } })); } catch {}
    return { source: 'guest', items };
  }

  // signed in: call backend
  const totalPrice = (Number(price || 0) * Number(quantity || 1)).toFixed(2);
  const res = await api.post(`/carts/add?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}&quantity=${encodeURIComponent(quantity)}&totalPrice=${encodeURIComponent(totalPrice)}`);
  try { window.dispatchEvent(new CustomEvent('cart-updated', { detail: { source: 'server', data: res.data } })); } catch {}
  return { source: 'server', data: res.data };
}

export default { loadGuestCart, saveGuestCart, addToCart };
