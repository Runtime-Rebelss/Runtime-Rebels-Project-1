import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import api from '../../lib/axios.js';
import toast from 'react-hot-toast'
import ProductCard from "../../components/ProductCard";
import useFetchProducts from "../../components/actions/useFetchProducts";
import Hero from "../../components/Hero";


const AdminPage = () => {
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

export default AdminPage;
