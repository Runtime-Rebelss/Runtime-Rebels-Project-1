import api from "./axios";
import orderLib from "./orders.js";
import Cookies from "js-cookie";

/**
 * Fetch orders for current context (guest or signed-in user).
 * Returns an array of orders. For signed-in users the items are enriched.
 */
export async function fetchOrders(signal) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        const guestOrder = orderLib.readLocalOrders();
        return Array.isArray(guestOrder) ? guestOrder : [guestOrder];
    }
    return await orderLib.loadServerOrders(userId, signal);
}

/**
 * Fetch order details for given orderId. For guests it looks up local orders.
 * For signed-in users it calls backend `/orders/details/:orderId`.
 * Returns an object { order, products, items } where `items` is an array used by pages.
 */
export async function fetchOrderDetails(orderId, signal) {
    const userId = Cookies.get("userId");
    if (!userId) {
        const local = orderLib.readLocalOrders();
        const order = (Array.isArray(local) ? local : [local]).find((o) => (o.id || o._id) === orderId);
        if (!order) return { order: null, products: [], items: [] };

        // For guest orders, `order.items` is typically the item array.
        const items = order.items || [];
        return { order, products: items, items };
    }

    // Signed-in: backend returns { order, products }
    const res = await api.get(`/orders/details/${encodeURIComponent(orderId)}`, { signal });
    // Some controllers return the order and products directly — normalize shape
    const payload = res.data || {};
    const order = payload.order ?? payload; // fallback if response is the order itself
    const products = payload.products ?? payload.products ?? payload.products ?? payload.products ?? payload.products ?? [];
    // if products is a list of Product, use them as items
    return { order, products, items: products };
}

export default { fetchOrders, fetchOrderDetails };