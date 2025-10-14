import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import toast from 'react-hot-toast'

import api from '../lib/axios'
import Navbar from '../components/Navbar'

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Failed to load product!");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <span className="loading loading-spinner loading-xl"></span>
        </div>
    )
  }

    if (!product) return <div className="p-6 text-center">Product not found</div>;

    return (
        <div>
            <Navbar />
            <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-10">
                {/* Image */}
                <div className="flex-1 flex items-center justify-center">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-w-sm w-full h-auto object-contain"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center">
                    {/* Category */}
                    <p className="text-gray-500 uppercase text-sm tracking-wide mb-2">
                        {product.category}
                    </p>

                {/* Name */}
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                {/* Price */}
                <p className="text-2xl text-gray-800 font-semibold mb-4">
                    ${Number(product.price).toFixed(2)}
                </p>

                {/* Description */}
                <p className="text-gray-600 mb-6">{product.description}</p>

                {/* Add to bag */}
                <button
                    onClick={() => toast.success(`Added ${product.name} to bag!`)}
                    className="btn btn-primary btn-block text-white text-lg"
                >
                    Add to Bag
                </button>

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-gray-600 underline text-sm hover:text-gray-900"
                >
                    ← Back to Products
                </button>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
