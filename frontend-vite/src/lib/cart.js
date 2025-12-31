import api from "./axios";
import Cookies from "js-cookie"
import addressLib from "./addresses.js";
import normalizeItem from "../components/actions/normalizeItem.js";

const GUEST_KEY = "guestCart";

/**
 * Guest cart
 */
// Creates a guest cart, unique to local host
export function loadGuestCart() {
    try {
        const raw = JSON.parse(localStorage.getItem(GUEST_KEY));
        const items = Array.isArray(raw?.items) ? raw.items : [];

        return {
            items: items
                .filter(Boolean)
                .map((it) => normalizeItem({
                    productId: it.productId || it.id,
                    name: it.name,
                    image: it.image || it.imageUrl,
                    price: Number(it.price ?? it.finalPrice ?? it.itemTotal),
                    quantity: Number(it.quantity || 1),
                })
                )
                .filter(it => it.productId),
        };
    } catch {
        return {items: []};
    }
}

export const saveGuestCart = (items) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify({ items: Array.isArray(items) ? items : items.items}));
}

/**
 * Load signed-in user's cart from the server and enrich with product details.
 * Returns items in the shape:
 *   { id, productId, name, image, price, quantity }
 */
export async function loadServerCart(userId, signal) {
    if (!userId) return [];

    const {data: cart} = await api.get(`/carts/${encodeURIComponent(userId)}`, {signal});

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

        const needsFetch = items.filter(it => !it.name || !it.price || !it.image);
        if (needsFetch.length === 0) return items;

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
 * Supports either addToCart({userId, productId, ...}) or addToCart(productId, quantity, userId, name, price, image)
 */
export async function addToCart(...args) {
    let opts = {};
    if (args.length === 1 && typeof args[0] === 'object') opts = args[0];
    else {
        const [productId, quantity = 1, userId, name = '', price = 0, image = ''] = args;
        opts = { productId, quantity, userId, name, price, image };
    }
    const { userId, productId, name, price, quantity = 1, image = "" } = opts;

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
        )}`
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
 * updateQuantity supports updateQuantity({productId, quantity, userId}) or updateQuantity(productId, quantity, userId)
 */
export async function updateQuantity(...args) {
    let productId, quantity, userId;
    if (args.length === 1 && typeof args[0] === 'object') {
        ({ productId, quantity, userId } = args[0]);
    } else {
        [productId, quantity, userId] = args;
    }

    if (!productId) throw new Error("Product Id is required");

    const uid = userId || Cookies.get("userId");
    const qty = Number(quantity);
    if (!Number.isFinite(qty)) throw new Error("Invalid quantity");
    if (qty < 0) throw new Error("Invalid quantity");

    if (uid) {
        // server-side update
        await api.put(`/carts/update`, null, { params: { userId: uid, productId, quantity: qty}});
        try { window.dispatchEvent(new CustomEvent("cart-updated", {detail: {source: "server"}})); } catch {}
        return {source: "server"};
    }

    // Guest cart update
    const cart = loadGuestCart();
    const items = Array.isArray(cart.items) ? [...cart.items] : [];

    const idx = items.findIndex(it => it.productId === productId || it.id === productId);
    if (idx === -1) return {source: "guest", items};

    if (qty === 0) items.splice(idx, 1);
    else items[idx].quantity = qty;

    saveGuestCart(items);

    try { window.dispatchEvent(new Event("cart-updated")); } catch {}
    return {source: "guest", items};
}

/**
 * Remove an item (guest or signed-in user).
 * Supports removeItem(productId) or removeItem({productId})
 */
export async function removeItem(...args) {
    let productId;
    if (args.length === 1 && typeof args[0] === 'object') productId = args[0].productId;
    else productId = args[0];
    if (!productId) return;

    const userId = Cookies.get("userId");

    if (!userId) {
        const {items} = loadGuestCart();
        if (!Array.isArray(items)) return;

        const filtered = items.filter(it => it.productId !== productId &&
            it.id !== productId);
        // Save guest cart
        saveGuestCart(filtered);
        // Update navbar
        try { window.dispatchEvent(new Event("cart-updated")); } catch {}
        return {source: "guest", items: filtered};
    }
    // Server Code
    try {
        await api.delete(`/carts/remove`, { params: { userId, productId } });
        try { window.dispatchEvent(new CustomEvent("cart-updated", {detail: {source: "server"}})); } catch {}
        return {source: "server"};
    } catch (err) {
        try {
            await api.put(`/carts/update`, null, { params: { userId, productId, quantity: 0 } });
            try { window.dispatchEvent(new CustomEvent("cart-updated", {detail: {source: "server"}})); } catch {}
            return {source: "server"};
        } catch (err2) {
            throw err2;
        }
    }
}

// Method to handle checkout
export async function handleCheckout(userId, signal) {
    const userEmail = Cookies.get("userEmail");

    let addressId = null;
    if (userId) {
        try {
            const resp = await addressLib.getAddressesByUserId(userId);
            const addrs = resp?.data ?? [];
            const def = addrs.find(a => a?.isDefault) || null;
            addressId = def?.id ?? def?._id ?? null;
        } catch (err) {
            try {
                const resp2 = await addressLib.getDefaultAddressById(userId);
                addressId = resp2?.data?.id ?? resp2?.data?._id ?? null;
            } catch (err2) {
                addressId = null;
            }
        }
    }

    if (!userId) {
        const {items} = loadGuestCart();
        // Save the order info as an array of items (OrderSuccessPage expects an array)
        localStorage.removeItem("pendingGuestOrder");
        localStorage.setItem("pendingGuestOrder", JSON.stringify(items));

        const cartItems = items.map(item => ({
                name: item.name,
                unitAmount: Math.round(item.price * 100),
                currency: "usd",
                quantity: item.quantity,
        }));

        const response = await api.post("/payments/create-checkout-session", {
            items: cartItems,
            customerEmail: Cookies.get("userEmail") || null,
            metadata: {
                checkoutType: userId ? "server" : "guest",
                userId: userId || "guest",
                addressId: addressId || null,
            },
            savePaymentMethod: false,
        }, {signal});
        return response.data.url;
    }

    const serverItems = await loadServerCart(userId, signal);

    // Save the order info
    sessionStorage.removeItem("pendingServerOrder");
    sessionStorage.setItem("pendingServerOrder", JSON.stringify(serverItems));

    const cartItems = serverItems.map(item => ({
        name: item.name,
        unitAmount: Math.round(item.price * 100),
        currency: "usd",
        quantity: item.quantity,
    }));

    const response = await api.post("/payments/create-checkout-session", {
        items: cartItems,
        customerEmail: userEmail,
        addressId: addressId || null,
        metadata: {
            checkoutType: userId ? "server" : "guest",
            userId: userId || "guest",
        },
        savePaymentMethod: true,
    }, {signal});

    return response.data.url;
}

export function clearGuestCart(shouldConfirm = true) {
    if (shouldConfirm) {
        const ok = window.confirm('Clear your guest cart? This will remove all items stored on this device.');
        if (!ok) return false;
    }
    localStorage.removeItem(GUEST_KEY);
    try { window.dispatchEvent(new Event("cart-updated")); } catch {}
    return true;
}

export function calcTotal(items) {
    return items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
}

export default {
    loadGuestCart,
    saveGuestCart,
    loadServerCart,
    addToCart,
    updateQuantity,
    removeItem,
    handleCheckout,
    clearGuestCart,
    calcTotal,
};
