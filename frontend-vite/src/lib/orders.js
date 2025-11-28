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
        localStorage.setItem("guestOrders", JSON.stringify(orders || []));
    } catch {}
}

export function seedSampleOrder() {
    const sample = {
        id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
        shipTo: { fullName: "Guest User" },
        status: "Processing",
        items: [
            { id: "sku_demo1", name: "Wireless Headphones", price: 59.99, quantity: 1,
                image: "https://images.unsplash.com/photo-1518443895914-6ce54b7f7e9a?auto=format&fit=crop&w=600&q=60" },
            { id: "sku_demo2", name: "USB-C Charger 65W", price: 29.95, quantity: 2,
                image: "https://images.unsplash.com/photo-1586816879360-004f5b0c51cd?auto=format&fit=crop&w=600&q=60" },
        ],
    };
    sample.total = sample.items.reduce((s, it) => s + it.price * it.quantity, 0);
    const current = readLocalOrders();
    writeLocalOrders([...current, sample]);
}

export default { readLocalOrders, writeLocalOrders, seedSampleOrder };
