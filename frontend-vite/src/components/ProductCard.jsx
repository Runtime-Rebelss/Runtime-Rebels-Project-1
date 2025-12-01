import { Link } from "react-router";
import React from "react";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import { addToCart } from "../lib/cart";


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
    const userId = localStorage.getItem("userId");

    // support multiple shapes (productId, id, _id)
    const productId =
        product?.productId ??
        product?.id ??
        product?._id ??
        "";

    const handleAddToBag = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!productId) {
            console.error("No productId found on product:", product);
            toast.error("Unable to add this item (missing id).");
            return;
        }

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
            console.error("Failed to add to cart:", err);
            toast.error("Failed to add item");
        }
    };

    return (
        <div className="card bg-base-200 shadow-sm hover:shadow-lg transition-all duration-200">
            {/* Only image/title navigate to the product detail page */}
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
                <h2 className="card-title text-base-content">
                    <Link to={`/product/${productId}`}>{product.name}</Link>
                </h2>

                <div className="card-actions flex justify-between items-center mt-4">
                    <div className="font-normal text-2xl">
                        ${Number(product.price).toFixed(2)}
                    </div>

                    <button
                        className="btn btn-soft btn-primary rounded-full gap-2"
                        onClick={handleAddToBag}
                    >
                        <ShoppingBag />
                        <span>Add to Bag</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;