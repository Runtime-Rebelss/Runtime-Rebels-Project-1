import { useEffect } from "react";
import toast from "react-hot-toast";

import api from "../../lib/axios";

/**
 * Hook to fetch products from backend.
 *
 * @param {string[]|null} categories - Categories to filter by. Pass null/[] to fetch all.
 * @param {ProductsSetter} setProducts - State setter for products (see types.js)
 * @param {LoadingSetter} setLoading - State setter for loading (see types.js)
 * @returns {object} helper object exposing `fetchProducts`
 */
function useFetchProducts(categories, setProducts, setLoading) {

    /**
     * Perform the API request. Uses `categories` to build the URL.
     * @returns {Promise<void>}
     */
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories]);

    return { setProducts, setLoading, fetchProducts };
}
export default useFetchProducts;