import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import api from "../../lib/axios";

function useFetchProducts(category, setProducts, setLoading) {

    const products = useState([]);
    const loading = useState(true);

    const fetchProducts = async () => {

      try {
        // If no category param is provided, fetch all products. Otherwise
        // fetch by category. This makes the component more robust.
        const url = category ? `/products/category/${category}` : '/products';
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
    }, [category]);

    return { setProducts, setLoading, fetchProducts };
}
export default useFetchProducts;