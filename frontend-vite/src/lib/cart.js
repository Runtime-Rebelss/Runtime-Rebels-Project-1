import api from './axios';

const GUEST_KEY = 'guestCart';

// tiny helper
const toInt = (v, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
};
const toQty = (v) => Math.max(1, toInt(v, 1));

export function loadGuestCart() {
    try {
        const raw = localStorage.getItem(GUEST_KEY);
        const parsed = raw ? JSON.parse(raw) : { items: [] };
        return Array.isArray(parsed.items) ? parsed.items : [];
    } catch {
        return [];
    }
}

export function loadServerCart() {
    try {
        const raw = localStorage.getItem("userEmail");
        const parsed = raw ? JSON.parse(raw) : { items: [] };
        return Array.isArray(parsed.items) ? parsed.items : [];
    } catch {
        return [];
    }
}

export function saveGuestCart(items) {
    localStorage.setItem(GUEST_KEY, JSON.stringify({ items }));
}

export async function addToCart({
                                    userId,
                                    productId,
                                    name,
                                    price,
                                    quantity = 1,
                                    image = '',
                                    signal,
                                }) {
    if (!productId) throw new Error('productId required');

    // For guest users
    if (!userId) {
        const items = loadGuestCart();
        const idx = items.findIndex((it) => it.productId === productId);
        const addQty = toQty(quantity);

        if (idx >= 0) {
            items[idx].quantity = toQty((items[idx].quantity || 1) + addQty);
            if (name) items[idx].name = name;
            if (price != null) items[idx].price = toInt(price, items[idx].price || 0);
            if (image) items[idx].image = image;
        } else {
            items.push({
                productId,
                name: name || 'Item',
                price: toInt(price, 0),
                quantity: addQty,
                image: image || '',
            });
        }

        saveGuestCart(items);
        try {
            window.dispatchEvent(new CustomEvent('cart-updated', { detail: { source: 'guest', items } }));
        } catch {}
        return { source: 'guest', items };
    }

    // For users signed-in user
    try {
        const qty = toQty(quantity);
        const unit = toInt(price, 0);
        const totalPrice = (unit * qty).toFixed(2);

        const res = await api.post(
            '/carts/add',
            null,
            {
                params: { userId, productId, quantity: qty, totalPrice },
                signal,
            }
        );

        try {
            window.dispatchEvent(new CustomEvent('cart-updated', { detail: { source: 'server', data: res.data } }));
        } catch {}
        return { source: 'server', data: res.data };
    } catch (err) {
        const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            'Failed to add to cart';
        throw new Error(msg);
    }
}

export default { loadGuestCart, saveGuestCart, addToCart };
