import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/axios';

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product details:', error);
            }    
        };

        fetchProduct();
    }, [id]);

    if (!product) {
        return <span className="loading loading-spinner loading-xl"></span>;
    }

    return (
        <div>
            <h1>{product.name}</h1>
            <img src={product.imageUrl} alt={product.name} width="200" />
            <p>{product.description}</p>
            <p><strong>Price:</strong> ${product.price}</p>
        </div>
    );
}

export default ProductDetails;