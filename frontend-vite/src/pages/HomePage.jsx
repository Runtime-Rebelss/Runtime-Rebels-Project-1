import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import api from "../lib/axios";

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/products");
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to fetch products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="loading loading-spinner loading-xl"></span>
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            {/* 🧩 HERO SECTION - Add this right after Navbar */}
            <div className="hero min-h-[60vh] bg-base-200 rounded-xl mb-10">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <img
                        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                        className="max-w-sm rounded-lg shadow-2xl"
                        alt="featured product"
                    />
                    <div>
                        <h1 className="text-5xl font-bold">Step into your style</h1>
                        <p className="py-6 text-lg text-gray-600">
                            Discover our latest collection of shoes, apparel, and accessories.
                        </p>
                        <a href="/products" className="btn btn-primary">
                            Shop Now
                        </a>
                    </div>
                </div>
            </div>
            {/* 🧩 END HERO */}

            {/* 🧩 PRODUCT GRID */}
            <div className="container mx-auto mt-8">
                <h1 className="text-3xl font-bold mb-6">Featured Products</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
