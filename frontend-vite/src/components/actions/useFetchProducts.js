import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import api from "../../lib/axios";

function useFetchProducts(categories, setProducts, setLoading) {

    const products = useState([]);
    const loading = useState(true);

    const fetchProducts = async () => {

      try {
        // If categories is null/undefined or empty, fetch all products
        // Otherwise fetch by category. This makes the component more robust.
        const url = categories?.length > 0 ? `/products/category?${categories.map(category => `categories=${category}`).join('&')}` : '/products';
        console.log(url);
        console.log('Current Categories: ', categories);
        const response = await api.get(url);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      setLoading(true);
      fetchProducts();
    }, [categories]);

    return { setProducts, setLoading, fetchProducts };
}
export default useFetchProducts;