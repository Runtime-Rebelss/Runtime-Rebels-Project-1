import api from "./axios";
import Cookies from "js-cookie";

const GUEST_KEY = "guestCart";

// Guest cart
export function loadGuestCart() {
    try {
        const raw = localStorage.getItem(GUEST_KEY);
        const parsed = JSON.parse(raw || "{}");
        return Array.isArray(parsed.items) ? parsed.items : [];
    } catch {
        return [];
    }
}

export function saveGuestCart(items) {
    localStorage.setItem(GUEST_KEY, JSON.stringify({ items }));
}

// Server Cart
export async function loadServerCart(userId, signal) {
    if (!userId) return [];

    const {data: cart} = await api.get(
        `/carts/${encodeURIComponent(userId)}`,
        {signal}
    );

    if (Array.isArray(cart?.items)) {
        const items = cart.items
            .filter(Boolean)
            .map((it) => {
                const product = it?.product ?? {};
                const quantity = Number(it?.quantity ?? 1) || 1;
                const unitPrice = Number(product?.price ?? product?.finalPrice ?? 0) || 0;
                return {
                    id: product?.id || product?._id || '',
                    productId: product?.id || product?._id || '',
                    name: product?.name || 'Item',
                    image: product?.image || product?.imageUrl || '',
                    price: unitPrice,
                    quantity,
                };
            })
            .filter((it) => it.productId);

        // Attempt to enrich any products that don't have full data by fetching missing product details
        const needsFetch = items.filter(it => !it.name || !it.price || !it.image);
        if (needsFetch.length === 0) return items;

        // For simplicity, fetch product details for all items in parallel and override
        const enriched = await Promise.all(items.map(async (it) => {
            try {
                const {data: product} = await api.get(`/products/${encodeURIComponent(it.productId)}`, {signal});
                const unitPrice = Number(product?.price ?? product?.finalPrice ?? it.price ?? 0) || 0;
                return {
                    id: it.productId,
                    productId: it.productId,
                    name: product?.name ?? it.name,
                    image: product?.image || product?.imageUrl || it.image,
                    price: unitPrice,
                    quantity: it.quantity,
                };
            } catch {
                return it;
            }
        }));

        return enriched.filter(Boolean);
    }

    // Fallback: older server shape using parallel arrays
    const productIds = Array.isArray(cart?.productIds) ? cart.productIds : [];
    const quantities = Array.isArray(cart?.quantity) ? cart.quantity : [];
    const totalPrices = Array.isArray(cart?.totalPrice) ? cart.totalPrice : [];

    const items = await Promise.all(
        productIds.map(async (productId, index) => {
            try {
                const {data: product} = await api.get(
                    `/products/${encodeURIComponent(productId)}`,
                    {signal}
                );
                const quantity = Number(quantities?.[index] ?? 1) || 1;
                const lineTotal = Number(totalPrices?.[index] ?? 0) || 0;

                let unitPrice = 0;
                if (lineTotal > 0 && quantity > 0) {
                    unitPrice = lineTotal / quantity;
                } else {
                    unitPrice =
                        Number(
                            product?.finalPrice ?? product?.price ?? 0) || 0;
                }

                return {
                    id: productId,
                    name: product?.name,
                    image: product?.image || product?.imageUrl || "",
                    price: unitPrice,
                    quantity,
                };
            } catch {
                // If a single product fetch fails, just skip that item
                return null;
            }
        })
    );

    return items.filter(Boolean);
}

export async function addToCart({ userId, productId, name, price, quantity = 1, image }) {
    if (!userId) {
        // Guest Mode
        const items = loadGuestCart();
        const idx = items.findIndex(it => it.id === productId);

        if (idx >= 0) items[idx].quantity += quantity;
        else {
            items.push({
                id: productId,
                name,
                price: Number(price),
                quantity: Number(quantity),
                image
            });
        }

        saveGuestCart(items);
        return { mode: "guest", items };
    }

    // Server
    const totalPrice = (price * quantity).toFixed(2);

    const { data } = await api.post(
        `/carts/add?userId=${userId}&productId=${productId}&quantity=${quantity}&totalPrice=${totalPrice}`
    );

    return { mode: "server", data };
}

export async function removeItem(userId, productId) {

    if (!userId) {
        // Guest
        const items = loadGuestCart().filter(it => it.id !== productId);
        saveGuestCart(items);
        return { mode: "guest", items };
    }

    // Server
    const { data } = await api.delete(`/carts/remove/${userId}/${productId}`);
    return { mode: "server", data };
}

export async function updateQuantity(userId, productId, qty) {
    qty = Math.max(1, Number(qty));

    if (!userId) {
        const items = loadGuestCart();
        const idx = items.findIndex(it => it.id === productId);
        if (idx === -1) return;

        items[idx].quantity = qty;
        saveGuestCart(items);
        return { mode: "guest", items };
    }

    const { data } = await api.put(
        `/carts/update-qty/${userId}/${productId}?quantity=${qty}`
    );

    return { mode: "server", data };
}

export async function checkout(userId, cartItems, email) {
    console.log('Checkout called with:', { userId, cartItems, email });

    if (!userId) {
        // Guest checkout
        try {
            console.log('Saving pending guest order:', cartItems);
            localStorage.removeItem("pendingGuestOrder");
            localStorage.setItem("pendingGuestOrder", JSON.stringify(cartItems));

            const items = cartItems.map(i => ({
                name: i.name,
                unitAmount: Math.round(i.price * 100),
                quantity: i.quantity,
                currency: "usd"
            }));

            console.log('Guest items:', items);

            const { data } = await api.post("/payments/create-checkout-session", {
                items,
                customerEmail: email || null,
                savePaymentMethod: false,
            });

            return data.url;
        } catch (err) {
            console.error('Guest checkout failed:', err);
            const msg = err?.response?.data?.message || err?.message || 'Guest checkout failed';
            throw new Error(msg);
        }
    }

    // Server Checkout
    try {
        console.log('Saving pending server order:', cartItems);
        localStorage.setItem('pendingServerOrder', JSON.stringify(cartItems));

        const userEmail = email || localStorage.getItem('userEmail') || null;
        const items = cartItems.map(i => ({
            name: i.name,
            unitAmount: Math.round(i.price * 100),
            quantity: i.quantity,
            currency: "usd"
        }));

        console.log('Server items:', items);
        console.log('Posting to /payments/create-checkout-session with:', { userId, items, userEmail });

        const { data } = await api.post("/payments/create-checkout-session", {
            userId,
            items,
            customerEmail: userEmail,
            savePaymentMethod: true,
        }, {
            params: { userId }
        });

        return data.url;
    } catch (err) {
        console.error('Server checkout failed:', err);
        const msg = err?.response?.data?.message || err?.message || 'Server checkout failed';
        throw new Error(msg);
    }
}

export function calcTotal(items) {
    return items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
}

export default {
    loadGuestCart,
    saveGuestCart,
    loadServerCart,
    addToCart,
    removeItem,
    updateQuantity,
    checkout,
    calcTotal,
    handleCheckout: checkout,
};
