import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";

import api from "../../lib/axios";

import { buildMergedParams } from '../../lib/query';

/** @typedef {import('../../lib/types').ProductsSetter} ProductsSetter */
/** @typedef {import('../../lib/types').LoadingSetter} LoadingSetter */

/**
 * Hook to fetch products from backend.
 * 
 * @author Frank Gonzalez
 * @since 11-19-2025
 *
 * @param {URLSearchParams|Object|string} inputParams - URL search params or plain object (e.g. from `useSearchParams()`)
 * @param {ProductsSetter} setProducts - State setter for products (see types.js)
 * @param {LoadingSetter} setLoading - State setter for loading (see types.js)
 * @param {{search?:string, categories?:string[]}} [overrides] - Optional overrides to append or replace params
 * @returns {object} helper object exposing `fetchProducts`
 */
function useFetchProducts(inputParams, setProducts, setLoading, overrides = {}) {

    

    const mergedParams = useMemo(() => buildMergedParams(inputParams, overrides), [inputParams, JSON.stringify(overrides)]);

    

    /**
     * Perform the API request. Uses `categories` to build the URL.
     * @returns {Promise<void>}
     */
    const fetchProducts = async () => {
      try {
        // If mergedParams has any entries, request /products/results with the query string,
        // otherwise request the base /products endpoint.
        const qs = mergedParams ? mergedParams.toString() : '';
        const url = qs ? `/products/results?${qs}` : '/products';
        console.log(url);
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
    }, [mergedParams.toString()]);

    return { setProducts, setLoading, fetchProducts };
}
export default useFetchProducts;