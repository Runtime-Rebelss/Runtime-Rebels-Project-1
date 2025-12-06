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
            <div className="w-full h-64 flex items-center justify-center bg-gradient-to-b from-[#f8f1df] to-[#e6d7b6] overflow-hidden rounded-lg">
                <img
                    className="max-h-full max-w-full object-contain p-4"
                    src={product.imageUrl || product.image}
                    alt={product.name}
                />
            </div>

            <div className="card-body flex flex-col">

                {/* TITLE */}
                <h2 className="card-title text-base-content mb-1">
                    <Link to={`/product/${productId}`}>{product.name}</Link>
                </h2>

                {/* PRICE (smaller + closer to title) */}
                <div className="text-xl font-normal mb-2">
                    ${Number(product.price).toFixed(2)}
                </div>

                {/* USER BUTTON (only visible for customers) */}
                {!isAdmin && (
                    <button
                        className="btn btn-soft btn-primary rounded-full gap-2 transition"
                        onClick={handleAddToBag}
                    >
                        <ShoppingBag size={18} />
                        <span>Add to Bag</span>
                    </button>
                )}

                {/* ADMIN BUTTONS */}
                {isAdmin && (
                    <div className="mt-auto flex justify-center">
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