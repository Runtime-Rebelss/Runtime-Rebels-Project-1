const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const toNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

const normalizeItem = ({
                           product,
                           productId,
                           name,
                           image,
                           price,
                           quantity = 1,
                           lineTotal = 0,
                       }) => {
    const qty = Math.max(1, toNumber(quantity, 1));
    let unitPrice = toNumber(price);

    if (!unitPrice && lineTotal > 0) {
        unitPrice = lineTotal / qty;
    }

    return {
        id: product?.id || product?._id || productId || "",
        productId: product?.id || product?._id || productId || "",
        name: product?.name || name || "Item",
        image:
            product?.image ||
            product?.imageUrl ||
            image ||
            DEFAULT_IMAGE,
        price: unitPrice,
        quantity: qty,
    };
};

export default normalizeItem;