import api from "./axios";
import toast from "react-hot-toast";

const GUEST_KEY = "guestCart";

/**
 * Guest cart
 */
// Creates a guest cart, unique to local host
export function loadGuestCart() {
    try {
        const raw = localStorage.getItem(GUEST_KEY);
        const parsed = raw ? JSON.parse(raw) : {items: []};
        if (!Array.isArray(parsed.items)) return {items: []};
        // Normalize items (tolerate older shapes)
        const items = parsed.items
            .filter(Boolean)
            .map((it) => ({
                productId: it.productId ?? it.id ?? it._id ?? '',
                name: it.name ?? 'Item',
                price: Number(it.price ?? it.finalPrice ?? it.itemTotal ?? 0),
                image:
                    it.image ||
                    it.imageUrl ||
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                quantity: Math.max(1, Number(it.quantity ?? 1)),
            }))
            .filter((it) => it.productId);
        return {items};
    } catch {
        return {items: []};
    }
}

export function saveGuestCart(data) {
    const items = Array.isArray(data) ? data : data.items;
    localStorage.setItem(GUEST_KEY, JSON.stringify({items}));
}

/**
 * Load signed-in user's cart from the server and enrich with product details.
 * Returns items in the shape:
 *   { id, productId, name, image, price, quantity }
 */
export async function loadServerCart(userId, signal) {
    if (!userId) return [];

    const {data: cart} = await api.get(
        `/carts/${encodeURIComponent(userId)}`,
        {signal}
    );

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

/**
 * Add item to cart (guest or signed-in user).
 */
export async function addToCart({userId, productId, name, price, quantity = 1, image = ""}) {
    if (!productId) throw new Error("Product Id is required");

    if (!userId) {
        const {items} = loadGuestCart();

        const idx = items.findIndex(
            it => it.productId === productId || it.id === productId
        );

        if (idx >= 0) {
            items[idx].quantity += Number(quantity || 1);
        } else {
            items.push({
                id: productId,
                productId,
                name,
                price: Number(price || 0),
                image,
                quantity: Number(quantity || 1),
            });
        }
        // saves the items
        saveGuestCart(items);
        // Updates navbar
        window.dispatchEvent(new Event("cart-updated"));
        return {source: "guest", items};
    }

    const qty = Number(quantity || 1);
    const unit = Number(price || 0) || 0;
    const totalPrice = (unit * qty).toFixed(2);

    const res = await api.post(
        `/carts/add?userId=${encodeURIComponent(
            userId
        )}&productId=${encodeURIComponent(
            productId
        )}&quantity=${encodeURIComponent(
            qty
        )}&totalPrice=${encodeURIComponent(totalPrice)}`
    );

    try {
        window.dispatchEvent(new CustomEvent("cart-updated", {
            detail: {source: "server", data: res.data},
        }));
    } catch {
    }
    return {source: "server", data: res.data};
}

/**
 * Update quantity for a signed-in user.
 * For guests, you can still directly modify localStorage in CartPage if you want,
 * but here we focus on the user/server path.
 */
export async function updateQuantity({productId, quantity}) {
    if (!productId) throw new Error("Product Id is required");

    let qty = Number(quantity);
    if (!Number.isFinite(qty)) qty = 1;
    if (qty < 0) qty = 0;

    const cart = loadGuestCart();
    const items = Array.isArray(cart.items) ? [...cart.items] : [];

    const idx = items.findIndex(it => it.productId === productId);
    if (idx === -1) return;

    if (qty === 0) items.splice(idx, 1);
    else items[idx].quantity = qty;

    saveGuestCart({items});

    window.dispatchEvent(new Event("cart-updated"));
}

/**
 * Remove an item from a signed-in user's cart.
 */
export async function removeItem(productId) {
    if (!productId) return;

    const userId = localStorage.getItem("userId");

    if (!userId) {
        const {items} = loadGuestCart();
        if (!Array.isArray(items)) return;

        const filtered = items.filter(it => it.productId !== productId &&
            it.id !== productId);
        // Save guest cart
        saveGuestCart(filtered);
        // Update navbar
        window.dispatchEvent(new Event("cart-updated"));
    }
}

// Method to handle checking out
export async function handleCheckout(userId, signal) {
    const userEmail = localStorage.get("userEmail");

    if (!userId) {
        const {items} = loadGuestCart();
        // Save the order info
        localStorage.setItem("guestOrder", JSON.stringify({items}));

        const cartItems = items.map(item => ({
                name: item.name,
                unitAmount: Math.round(item.price * 100),
                currency: "usd",
                quantity: item.quantity,
        }));

        const response = await api.post("/payments/create-checkout-session", {
            items: cartItems,
            customerEmail: localStorage.getItem("userEmail") || null,
            savePaymentMethod: false,
        }, {signal});
        return response.data.url;
    }

    const serverItems = await loadServerCart(userId, signal);

    const cartItems = serverItems.map(item => ({
        name: item.name,
        unitAmount: Math.round(item.price * 100),
        currency: "usd",
        quantity: item.quantity,
    }));

    const response = await api.post("/payments/create-checkout-session", {
        items: cartItems,
        customerEmail: userEmail,
        savePaymentMethod: true,
    }, {signal});

    return response.data.url;


}

export const clearGuestCart = () => {
    if (!isGuest) return;
    const ok = window.confirm('Clear your guest cart? This will remove all items stored on this device.');
    if (!ok) return;
    cartLib.saveGuestCart([]);
    setCartItems([]);
};

export default {
    loadGuestCart, saveGuestCart, loadServerCart, addToCart, updateQuantity,
    removeItem,
};
