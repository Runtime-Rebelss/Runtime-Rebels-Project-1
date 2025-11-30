import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import api from "../lib/axios";
import useFetchProducts from "../components/actions/useFetchProducts";

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useFetchProducts(null, setProducts, setLoading);

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
            <Hero />

            {/* PRODUCT GRID */}
            <div className="container mx-auto mt-8 mb-8">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Featured Products
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const productId =
                            product?.productId ??
                            product?.id ??
                            product?._id ??
                            Math.random().toString(36); // fallback to avoid React key warnings

                        return (
                            <ProductCard key={productId} product={product} />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
