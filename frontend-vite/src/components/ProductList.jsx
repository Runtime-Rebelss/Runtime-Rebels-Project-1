import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../lib/axios';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to load products!");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    

    return (
        <div>
            <h1>Product List</h1>
            <ul>
                {products.map(product => (
                    <li key={product.id}>
                        <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default ProductList;