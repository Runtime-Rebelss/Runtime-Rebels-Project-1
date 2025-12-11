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
            const productIds = order.productIds || [];
            const quantities = order.quantity || [];
            const totals = order.totalPrice || [];

            const items = await Promise.all(
                productIds.map(async (productId, i) => {
                    try {
                        const { data: product } = await api.get(`/products/${productId}`, { signal });

                        const quantity = Number(quantities[i] || 1);
                        const lineTotal = Number(totals[i] || 0);

                        // Change from line to unit price
                        const unitPrice = quantity > 0 ? lineTotal / quantity : 0;

                        return {
                            id: productId,
                            name: product.name,
                            image: product.image || product.imageUrl,
                            price: unitPrice,
                            quantity,
                        };
                    } catch {
                        return null;
                    }
                })
            );
            return {...order, items: items.filter(Boolean),
            };
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