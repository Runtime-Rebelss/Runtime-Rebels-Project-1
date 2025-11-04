import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import api from '../lib/axios'
import ProductCard from '../components/ProductCard'
import Filters from '../components/Filters'
import Navbar from '../components/Navbar'
import useFetchProducts from '../components/actions/useFetchProducts'

const ResultsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { category } = useParams();
  // Build a unique list of category names from either `product.category` (string)
  // or `product.categories` (array) so the UI reliably shows filters.
  const categories = Array.from(
    new Set(
      products.flatMap((product) => {
        const cats = [];
        if (product?.category) cats.push(product.category);
        if (Array.isArray(product?.categories)) cats.push(...product.categories);
        return cats;
      })
    )
  ).filter(Boolean);

  useFetchProducts(category, setProducts, setLoading);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className='container mx-auto mt-8 mb-8'>
        <div className='flex justify-between items-center mt-4 relative'>
          <h1 className='text-3xl font-bold mb-6 text-center'>Results</h1>
          <Filters categories={categories} cat={category} products={products}/>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResultsPage