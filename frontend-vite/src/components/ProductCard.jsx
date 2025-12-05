import { Link } from "react-router-dom";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag, Trash2 } from "lucide-react";
import { addToCart } from "../lib/cart";
import Cookies from "js-cookie"
import { deleteProduct } from "../lib/products";

/**
 * ProductCard renders a single product tile used in lists and grids.
 * 
 * @author Frank Gonzalez, Haley Kenney
 * @since 11-19-2025
 *
 * @param {{product: any}} props
 * @returns {Element}
 */
function ProductCard({ product }) {
    const userId = Cookies.get("userId");
    const isAdmin = Cookies.get("adminEmail") === "admin@gmail.com";
    const [showConfirm, setShowConfirm] = useState(false);

    const productId =
        product?.productId ??
        product?.id ??
        product?._id ??
        "";

    const handleAddToBag = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await addToCart({
                userId,
                productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.imageUrl || product.image,
            });

            toast.success("Added to bag!");
        } catch (err) {
            toast.error("Failed to add item");
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteProduct(productId);
            toast.success("Product deleted.");
            window.location.reload();
        } catch (err) {
            toast.error("Failed to delete.");
        }
    };

    return (
        <div className="card bg-base-200 shadow-sm hover:shadow-lg transition duration-200">

            {/* IMAGE */}
            <Link to={`/product/${productId}`}>
                <figure className="w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                        className="w-full p-4 object-contain"
                        src={product.imageUrl || product.image}
                        alt={product.name}
                    />
                </figure>
            </Link>

            <div className="card-body">

                {/* TITLE */}
                <h2 className="card-title text-base-content">
                    <Link to={`/product/${productId}`}>{product.name}</Link>
                </h2>

                {/* PRICE + (USER) ADD TO BAG ROW */}
                <div className="flex justify-between items-center mt-2">

                    {/* PRICE */}
                    <div className="font-normal text-2xl">
                        ${Number(product.price).toFixed(2)}
                    </div>

                    {/* USER BUTTON (unchanged layout) */}
                    {!isAdmin && (
                        <button
                            className="btn btn-soft btn-primary rounded-full gap-2 transition"
                            onClick={handleAddToBag}
                        >
                            <ShoppingBag size={18} />
                            <span>Add to Bag</span>
                        </button>
                    )}
                </div>

                {/* ADMIN BUTTONS — CENTERED BELOW PRICE */}
                {isAdmin && (
                    <div className="flex justify-center mt-3">
                        <div className="flex gap-3">

                            <Link
                                to={`/admin/edit/${productId}`}
                                className="btn btn-soft btn-primary rounded-full px-4"
                            >
                                Update
                            </Link>

                            <button
                                className="btn btn-soft btn-error rounded-full flex items-center gap-1 px-4"
                                onClick={() => setShowConfirm(true)}
                            >
                                <Trash2 size={16} />
                                Remove
                            </button>

                        </div>
                    </div>
                )}
            </div>

            {/* CONFIRM DELETE MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
                        <h3 className="text-lg font-semibold">
                            Are you sure?
                        </h3>
                        <p className="text-sm mt-2">
                            This action cannot be undone.
                        </p>

                        <div className="mt-4 flex justify-center gap-3">
                            <button
                                className="btn btn-soft"
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn btn-error"
                                onClick={confirmDelete}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductCard;