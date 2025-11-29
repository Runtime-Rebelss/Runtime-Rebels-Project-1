
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import api from '../lib/axios'
import ProductCard from '../components/ProductCard'
import Filters from '../components/Filters'
import Navbar from '../components/Navbar'
import useFetchProducts from '../components/actions/useFetchProducts'

const ResultsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    // Memoize categories so the array identity only changes when the
    // search params string changes. `searchParams.getAll` returns a new
    // array each call which was retriggering the fetch effect on every
    // render.
    const categories = useMemo(() => searchParams.getAll('categories'), [searchParams.toString()]);
    // Build a unique list of category names from either `product.category` (string)
    // or `product.categories` (array) so the UI reliably shows filters.
    const filterCategories = Array.from(
        new Set(
            products.flatMap((product) => {
                const cats = [];
                if (product?.category) cats.push(product.category);
                if (Array.isArray(product?.categories)) cats.push(...product.categories);
                return cats;
            })
        )
    ).filter(Boolean);

    useFetchProducts(categories, setProducts, setLoading);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className='container mx-auto mt-8 mb-8'>
                <div className='flex justify-between items-center mt-4 relative'>
                    <h1 className='text-3xl font-bold mb-6 text-center'>Results</h1>
                    <Filters categories={filterCategories} selectedCategories={categories} />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {products.map((product) => (
                        <ProductCard key={product.id || product._id || product.productId} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ResultsPage;