import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Navbar from '../../components/Navbar.jsx';
import toast from 'react-hot-toast';
import ProductCard from "../../components/ProductCard";
import useFetchProducts from "../../components/actions/useFetchProducts";
import Hero from "../../components/Hero";
import Cookies from "js-cookie";

const AdminPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = Cookies.get("adminEmail") === "admin@gmail.com";

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

            <div className="container mx-auto mt-8 mb-8">

                {/* ADMIN HEADER */}
                {isAdmin && (
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h1 className="text-3xl font-bold">Products</h1>

                        <Link
                            to="/admin/add"
                            className="btn rounded-full px-8 py-3 text-lg font-semibold bg-neutral text-white hover:bg-neutral-focus transition-all shadow"
                        >
                            Add Product
                        </Link>
                    </div>
                )}

                {/* USER HEADER */}
                {!isAdmin && (
                    <h1 className="text-3xl font-bold mb-6 text-center">
                        Featured Products
                    </h1>
                )}

                {/* PRODUCT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const productId =
                            product?.productId ??
                            product?.id ??
                            product?._id ??
                            Math.random().toString(36);

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
