import api from './axios';

const toInt = (v, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
};
const toQty = (v) => Math.max(1, toInt(v, 1));

export function loadServerCart() {
    try {
        const raw = localStorage.getItem("userCart");
        const parsed = raw ? JSON.parse(raw) : { items: [] };
        return Array.isArray(parsed.items) ? parsed.items : [];
    } catch {
        return [];
    }
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
            });

        const serverCart = await res.data;

        if (serverCart?.productId && serverCart?.quantity) {
            const items = serverCart.productIds.map((id, i) => ({
                productId: id,
                quantity: quantity,
                totalPrice: serverCart.totalPrice?.[i],
            }));

            localStorage.setItem("userCart", JSON.stringify(items));
        }

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

export default { addToCart, loadServerCart };