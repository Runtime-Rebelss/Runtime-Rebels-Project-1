import CartCard from "./CartCard";
import {ShoppingBag} from "lucide-react";
import {useNavigate} from "react-router-dom";
import cartLib from "../lib/cart.js";

const CartContent = ({
                         cartItems,
                         onUpdateQuantity,
                         onRemove,
                     }) => {
    const navigate = useNavigate();

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return (
            <div className="card bg-base-100 border">
                <div className="card-body items-center text-center">
                    <ShoppingBag className="w-10 h-10 mb-4"/>
                    <h3>Your cart is empty</h3>
                    <button
                        className="btn btn-primary mt-4"
                        onClick={() => navigate("/")}
                    >
                        Explore Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="card bg-base-100 border">
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="table table-compact">
                            <thead>
                            <tr>
                                <th>Product</th>
                                <th className="w-40">Quantity</th>
                                <th className="text-right">Price</th>
                                <th/>
                            </tr>
                            </thead>
                            <tbody>
                            {cartItems.map((it) => (
                                <CartCard
                                    key={it.productId || it.id}
                                    item={it}
                                    onUpdateQuantity={onUpdateQuantity}
                                    onRemove={onRemove}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartContent;
