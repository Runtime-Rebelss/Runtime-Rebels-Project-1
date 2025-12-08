import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { getProductById, updateProduct } from "../lib/products";
import Cookies from "js-cookie";

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const isAdmin = Cookies.get("adminEmail") === "admin@gmail.com";

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdmin) {
            toast.error("Unauthorized.");
            navigate("/");
            return;
        }

        const fetchData = async () => {
            try {
                const { data } = await getProductById(id);

                // Ensure categories array exists
                const categories = Array.isArray(data.categories) ? data.categories : [];

                setProduct({
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    imageUrl: data.imageUrl || "",
                    categories: categories
                });
            } catch (err) {
                console.error("Failed to load product:", err);
                toast.error("Product not found");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate, isAdmin]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateProduct(id, {
                name: product.name,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl,
                categories: product.categories
            });

            toast.success("Product updated!");
            navigate("/admin");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update product");
        }
    };

    const handleCategoryChange = (e) => {
        const values = Array.from(e.target.selectedOptions, opt => opt.value);
        setProduct(prev => ({ ...prev, categories: values }));
    };

    if (loading || !product) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="loading loading-spinner loading-xl"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            <div className="container mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-6 text-center">Edit Product</h1>

                <form
                    onSubmit={handleSubmit}
                    className="max-w-xl mx-auto bg-base-100 p-6 rounded-lg shadow-md space-y-4"
                >
                    {/* NAME */}
                    <div>
                        <label className="label">Product Name</label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={product.name}
                            onChange={(e) =>
                                setProduct({ ...product, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="label">Description</label>
                        <textarea
                            className="textarea textarea-bordered w-full"
                            rows="4"
                            value={product.description}
                            onChange={(e) =>
                                setProduct({ ...product, description: e.target.value })
                            }
                            required
                        ></textarea>
                    </div>

                    {/* PRICE */}
                    <div>
                        <label className="label">Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input input-bordered w-full"
                            value={product.price}
                            onChange={(e) =>
                                setProduct({ ...product, price: parseFloat(e.target.value) })
                            }
                            required
                        />
                    </div>

                    {/* IMAGE URL */}
                    <div>
                        <label className="label">Image URL</label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={product.imageUrl}
                            onChange={(e) =>
                                setProduct({ ...product, imageUrl: e.target.value })
                            }
                        />
                    </div>

                    {/* CATEGORY MULTISELECT */}
                    <div>
                        <label className="label">Categories</label>
                        <select
                            className="select select-bordered w-full"
                            multiple
                            value={product.categories}
                            onChange={handleCategoryChange}
                        >
                            <option value="Men's">Men's</option>
                            <option value="Women's">Women's</option>
                            <option value="Jewelry">Jewelry</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Home & Garden">Home & Garden</option>
                        </select>
                        <p className="text-xs mt-1 opacity-70">(Hold CTRL/CMD to select multiple)</p>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4">
                        Save Changes
                    </button>

                    <button
                        type="button"
                        className="btn btn-neutral w-full mt-2"
                        onClick={() => navigate("/admin")}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProductPage;
