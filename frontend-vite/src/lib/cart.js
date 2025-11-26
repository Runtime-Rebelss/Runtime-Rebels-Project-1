import api from "./axios";

const GUEST_KEY = "guestCart";

/**
 * Guest cart
 */
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

/**
 * Load signed-in user's cart from the server and enrich with product details.
 * Returns items in the shape:
 *   { id, productId, name, image, price, quantity }
 */
export async function loadServerCart(userId, signal) {
    if (!userId) return [];

    const { data: cart } = await api.get(
        `/carts/${encodeURIComponent(userId)}`,
        { signal }
    );

    const productIds = Array.isArray(cart?.productIds)
        ? cart.productIds
        : [];
    const quantities = Array.isArray(cart?.quantity)
        ? cart.quantity
        : [];
    const totalPrices = Array.isArray(cart?.totalPrice)
        ? cart.totalPrice
        : [];

    const items = await Promise.all(
        productIds.map(async (productId, index) => {
            try {
                const { data: product } = await api.get(
                    `/products/${encodeURIComponent(productId)}`,
                    { signal }
                );

                const quantity =
                    Number(quantities?.[index] ?? 1) || 1;
                const lineTotal =
                    Number(totalPrices?.[index] ?? 0) || 0;

                // Derive unit price from lineTotal if possible,
                // otherwise fall back to product price.
                let unitPrice = 0;
                if (lineTotal > 0 && quantity > 0) {
                    unitPrice = lineTotal / quantity;
                } else {
                    unitPrice =
                        Number(
                            product?.finalPrice ?? product?.price ?? 0
                        ) || 0;
                }

                return {
                    id: productId,
                    productId,
                    name: product?.name ?? "Item",
                    image:
                        product?.image ||
                        product?.imageUrl ||
                        "",
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
export async function addToCart({
                                    userId,
                                    productId,
                                    name,
                                    price,
                                    quantity = 1,
                                    image = "",
                                }) {
    if (!productId) throw new Error("Product Id is required");

    // GUEST USER
    if (!userId) {
        const items = loadGuestCart();
        const idx = items.findIndex(
            (it) => it.productId === productId
        );

        if (idx >= 0) {
            items[idx].quantity =
                (Number(items[idx].quantity) || 0) +
                Number(quantity || 1);
        } else {
            items.push({
                productId,
                name,
                price,
                quantity,
                image,
            });
        }

        saveGuestCart(items);
        try {
            window.dispatchEvent(
                new CustomEvent("cart-updated", {
                    detail: { source: "guest", items },
                })
            );
        } catch {}
        return { source: "guest", items };
    }

    // SIGNED-IN USER
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
        window.dispatchEvent(
            new CustomEvent("cart-updated", {
                detail: { source: "server", data: res.data },
            })
        );
    } catch {}

    return { source: "server", data: res.data };
}

/**
 * Update quantity for a signed-in user.
 * For guests, you can still directly modify localStorage in CartPage if you want,
 * but here we focus on the user/server path.
 */
export async function updateQuantity({
                                         userId,
                                         productId,
                                         quantity,
                                         signal,
                                     }) {
    if (!userId) throw new Error("User Id is required");
    if (!productId) throw new Error("Product Id is required");

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0) {
        throw new Error("Quantity must be >= 0");
    }

    const res = await api.put(
        "/carts/update",
        null,
        {
            params: { userId, productId, quantity: qty },
            signal,
        }
    );

    try {
        window.dispatchEvent(
            new CustomEvent("cart-updated", {
                detail: { source: "server", data: res.data },
            })
        );
    } catch {}

    return res.data;
}

/**
 * Remove an item from a signed-in user's cart.
 */
export async function removeItem({ userId, productId, signal }) {
    if (!userId) throw new Error("User Id is required");
    if (!productId) throw new Error("Product Id is required");

    const res = await api.delete("/carts/remove", {
        params: { userId, productId },
        signal,
    });

    try {
        window.dispatchEvent(
            new CustomEvent("cart-updated", {
                detail: { source: "server", data: res.data },
            })
        );
    } catch {}

    return res.data;
}

export default { loadGuestCart, saveGuestCart, loadServerCart, addToCart, updateQuantity,
    removeItem,};
