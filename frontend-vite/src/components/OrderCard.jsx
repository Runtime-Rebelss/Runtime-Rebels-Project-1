import React from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import orderLib from "../lib/orders.js";
import orderService from "../lib/orderService";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";


function OrderCard({ order, detailsPage = false }) {
    const navigate = useNavigate();
    const orderId = order?.id || order?._id || "unknown-id";
    const orderDate = orderLib.fmtDate(order?.createdAt || order?.date || Date.now());
    const orderTotal = orderLib.fmtUSD(order?.total ?? order?.items?.reduce(
        (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
        0
    ));
    const fullName = Cookies.get("fullName");

    return (
        <div
            className="card bg-base-100 border border-base-300 overflow-hidden"
        >
            <div className="bg-base-200/60 border border-base-300 px-4 py-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                <div>
                    <div className="font-medium">Order Placed</div>
                    <div className="opacity-70">
                        {orderDate}
                    </div>
                </div>
                <div>
                    <div className="font-medium">Total</div>
                    <div className="opacity-70">{orderTotal}</div>
                </div>
                <div>
                    <div className="font-medium">Ship to</div>
                    <div className="opacity-70">
                        {fullName
                            || (order.shipTo?.fullName && order.shipTo.fullName !== "Guest Checkout" ? order.shipTo.fullName : "Guest")}
                    </div>
                </div>
                <div className="md:text-right">
                    <div className="font-medium">Order ID</div>
                    <div className="opacity-70">{orderId}</div>
                    {detailsPage === false ? (
                        <button className="text-primary-600 text-sm hover:underline text-gray-900" onClick={() => navigate(`/details/${orderId}`)}> View Order Details</button>
                    ) : null}
                </div>
            </div>

            <div className="p-4 divide-y divide-base-300">
                {(order.items || []).map((it, i) => (
                    <div
                        key={`${it.id || it.productId || i}-${orderId}`}
                        className="py-4 flex items-center gap-4"
                    >
                        <div className="w-20 h-20 flex items-center justify-center">
                            <img
                                src={it.imageUrl || it.image}
                                alt={it.name}
                                className="max-w-full max-h-full object-contain"
                                style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.12))" }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{it.name}</div>
                            <div className="text-sm opacity-70">
                                Qty: {it.quantity} • {orderLib.fmtUSD(Number(it.price || 0) * Number(it.quantity || 1))}
                            </div>
                        </div>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/product/${it.id || it.productId || ""}`)}
                        >
                            View item
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrderCard;