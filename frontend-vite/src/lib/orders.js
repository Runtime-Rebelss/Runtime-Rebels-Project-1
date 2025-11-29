// helpers/ordersLocal.js
export function readLocalOrders() {
    try {
        const raw = localStorage.getItem("guestOrder");
        if (!raw) return [];
        const data = JSON.parse(raw);

        // Preferred shape: an array of orders
        if (Array.isArray(data)) return data;

        // Legacy shape: { items: [...] } — treat as a single “order”
        if (data && Array.isArray(data.items)) {
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

export default { readLocalOrders, writeLocalOrders };
