import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import api from "../../lib/axios";

const AddAddressPage = () => {
    const navigate = useNavigate();
    const isAdmin = Cookies.get("adminEmail") === "admin@gmail.com";
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        categories: []
    });

    if (!isAdmin) {
        toast.error("Unauthorized");
        navigate("/");
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
        setFormData((prev) => ({ ...prev, categories: values }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.price) {
            toast.error("Please fill all required fields.");
            return;
        }

        try {
            await api.post("/products", {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                imageUrl: formData.imageUrl,
                categories: formData.categories
            });

            setShowSuccess(true);

            setTimeout(() => {
                navigate("/admin");
            }, 1400);
        } catch (err) {
            console.error(err);
            toast.error("Failed to add product.");
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            <div className="container mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Add New Address
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="max-w-xl mx-auto bg-base-100 p-6 rounded-lg shadow-md space-y-4"
                >
                    {/* NAME */}
                    <div>
                        <label className="label">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            className="input input-bordered w-full"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="label">Description</label>
                        <textarea
                            name="description"
                            className="textarea textarea-bordered w-full"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    {/* PRICE */}
                    <div>
                        <label className="label">Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="price"
                            className="input input-bordered w-full"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* IMAGE URL */}
                    <div>
                        <label className="label">Image URL (optional)</label>
                        <input
                            type="text"
                            name="imageUrl"
                            className="input input-bordered w-full"
                            value={formData.imageUrl}
                            onChange={handleChange}
                        />
                    </div>

                    {/* CATEGORY DROPDOWN */}
                    <div>
                        <label className="label">Categories</label>
                        <select
                            name="categories"
                            className="select select-bordered w-full"
                            multiple
                            value={formData.categories}
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
                        Add Product
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

            {/* SUCCESS ANIMATION OVERLAY */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="animate-bounce bg-green-500 text-white px-10 py-6 rounded-xl shadow-xl text-xl font-bold">
                        Product Added! 🎉
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddAddressPage;
