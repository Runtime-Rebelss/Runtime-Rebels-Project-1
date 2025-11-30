// helpers/ordersLocal.js
import api from "./axios.js";

export function readLocalOrders() {
    try {
        const raw = localStorage.getItem("guestOrder");
        if (!raw) return [];
        const data = JSON.parse(raw);

        // Preferred shape: an array of orders
        if (Array.isArray(data)) return data;

        // Legacy shape: { items: [...] } — treat as a single “order”
        if (data && Array.isArray(data.items)) {
            console.log(data.items)
            return [{
                id: "local-legacy",
                createdAt: new Date().toISOString(),
                items: data.items,
                total: data.items.reduce((s, it) =>
                    s + Number(it.price || 0) * Number(it.quantity || 1), 0),
                shipTo: { fullName: "Guest User" },
                status: "Processing"
            }];
        }

        return [];
    } catch {
        return [];
    }
}

export function writeLocalOrders(orders) {
    try {
        localStorage.setItem("guestOrder", JSON.stringify(orders || []));
    } catch {}
}

export function clearDedupeKey() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    sessionStorage.removeItem(`user-confirm-${sessionId}`);
    sessionStorage.removeItem(`guest-confirm-${sessionId}`);
    sessionStorage.removeItem("confirmedOrder");
}

export async function loadServerOrders(userId, signal) {
    if (!userId) return [];
    const { data: orderList } = await api.get(`/orders/user/${encodeURIComponent(userId)}`, { signal });
    if (!Array.isArray(orderList)) return [];

    return await Promise.all(
        orderList.map(async (order) => {
            const productIds = Array.isArray(order.productIds) ? order.productIds : [];
            const quantities = Array.isArray(order.quantity) ? order.quantity : [];
            const finalPrices = Array.isArray(order.totalPrice) ? order.totalPrice : [];

            const items = await Promise.all(
                productIds.map(async (productId, index) => {
                    try {
                        const {data: product} = await api.get(`/products/${encodeURIComponent(productId)}`, {signal});
                        const quantity = Number(quantities?.[index] ?? 1) || 1;
                        const basePrice =
                            Number(finalPrices?.[index]) ||
                            Number(product?.finalPrice) ||
                            Number(product?.price) ||
                            0;
                        console.log(product.name);
                        return {
                            id: productId,
                            name: product?.name ?? "Item",
                            image:
                                product?.image ||
                                product?.imageUrl ||
                                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                            price: Math.max(0, basePrice),
                            quantity,
                        };
                    } catch (e) {
                        console.warn("Failed to load product", productId, e);
                        return null;
                    }
                })
            );

            return {...order, items: items.filter(Boolean)};
        })
    );
}

export const fmtUSD = (n) =>
    `$${Number(n || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

export default { readLocalOrders, writeLocalOrders, clearDedupeKey, loadServerOrders, fmtUSD, fmtDate };
