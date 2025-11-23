import api from './axios';

const GUEST_KEY = 'guestCart';
const userEmail = localStorage.getItem("userEmail");

export function loadGuestCart() {
    try {
        const raw = localStorage.getItem(GUEST_KEY);
        const parsed = raw ? JSON.parse(raw) : { items: []};
        return Array.isArray(parsed.items) ? parsed.items : [];
    } catch {
        return [];
    }
}

export function loadServerCart() {
    try {
        const raw = localStorage.getItem(userEmail);
        const parsed = raw ? JSON.parse(raw) : { items: []};
        return Array.isArray(parsed.items) ? parsed.items : [];
    } catch {
        return [];
    }
}

export function saveGuestCart(items) {
    localStorage.setItem(GUEST_KEY, JSON.stringify({items}));
}

export function saveServerCart(items) {
    localStorage.setItem(userEmail, JSON.stringify({items}));
}

export async function addToCart({ userEmail, productId, name, price, quantity = 1}) {
    if (!productId) throw new Error('Product Id is required');

    if (!userEmail) {
        // This means it's a guest user
        const items = loadGuestCart();
        const idx = items.findIndex((it) => it.productId === productId);
        if (idx >= 0) {
            items[idx].quantity = (Number(items[idx].quantity) || 0) + Number(quantity || 1);
        } else {
            items.push({ productId, name, price, quantity, image: arguments[0]?.image || ''});
        }
        // Save the guestCart
        saveGuestCart(items);
        // Send out event to listeners
        try { window.dispatchEvent(new CustomEvent('cart-updated', { detail: { source: 'guest', items } })); } catch {}
        return {source: 'guest', items};
    } else {
        const items = loadServerCart();
        const idx = items.findIndex((it) => it.productId === productId);
        if (idx >= 0) {
            items[idx].quantity = (Number(items[idx].quantity) || 0) + Number(quantity || 1);
        } else {
            items.push({ productId, name, price, quantity, image: arguments[0]?.image || ''});
        }
        // Save the serverCart
        saveServerCart(items);
        // Send out event to listeners
        try { window.dispatchEvent(new CustomEvent('cart-updated', { detail: { source: 'user', items } })); } catch {}
        return {source: 'user', items};
    }

export default {loadGuestCart, loadServerCart, saveServerCart, saveGuestCart, addToCart};
