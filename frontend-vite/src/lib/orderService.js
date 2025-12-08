import api from "./axios";
import orderLib from "./orders.js";
import Cookies from "js-cookie";

/**
 * Fetch orders for current context (guest or signed-in user).
 * Returns an array of orders. For signed-in users the items are enriched.
 */
export async function fetchOrders(signal) {
    const userId = Cookies.get("userId");
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
        const order = (Array.isArray(local) ? local : [local]).find(
            (o) => (o.id || o._id) === orderId
        );

        if (!order) return { order: null, products: [], items: [] };

        const items = order.items || [];
        return { order, products: items, items };
    }

    const res = await api.get(
        `/orders/details/${encodeURIComponent(orderId)}`,
        { signal }
    );

    const payload = res.data || {};
    const order = payload.order ?? payload;

    const productIds = order.productIds || [];
    const quantities = order.quantity || [];
    const lineTotals = order.totalPrice || [];

    const items = await Promise.all(
        productIds.map(async (pid, i) => {
            try {
                const { data: product } = await api.get(`/products/${pid}`, {
                    signal,
                });

                const qty = Number(quantities[i] ?? 1);
                const lineTotal = Number(lineTotals[i] ?? 0);
                const unitPrice = qty > 0 ? lineTotal / qty : 0;

                return {
                    id: pid,
                    name: product.name,
                    image: product.image || product.imageUrl,
                    quantity: qty,
                    price: unitPrice,
                };
            } catch (err) {
                console.warn("Failed loading product for order:", pid, err);

                const qty = Number(quantities[i] ?? 1);
                const lineTotal = Number(lineTotals[i] ?? 0);
                const unitPrice = qty > 0 ? lineTotal / qty : 0;

                return {
                    id: pid,
                    name: "Unknown Product",
                    image: "",
                    quantity: qty,
                    price: unitPrice,
                };
            }
        })
    );

    return {
        order: {
            ...order,
            items,
            total: items.reduce((s, it) => s + it.price * it.quantity, 0),
        },
        products: items,
        items,
    };
}

export default { fetchOrders, fetchOrderDetails };