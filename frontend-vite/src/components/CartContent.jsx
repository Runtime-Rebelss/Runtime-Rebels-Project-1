import CartCard from "./CartCard";
import {ShoppingBag} from "lucide-react";
import {useNavigate} from "react-router-dom";

const CartContent = ({
                         loading,
                         cartItems,
                     }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <span className="loading loading-spinner loading-lg"/>
            </div>
        );
    }

    if (cartItems.length === 0) {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <table className="table">
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
                        />
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CartContent;
