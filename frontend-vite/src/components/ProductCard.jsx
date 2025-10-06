import { Link } from "react-router";
import React from "react";
import toast from "react-hot-toast";

import api from "../lib/axios";

function ProductCard({ product }) {



    return (
        <Link to={`/product/${product.id}`}
            className='card bg-base-200 shadow-sm hover:shadow-lg transition-all duration-200'
        >
            <figure>
                <img
                    src={product.imageUrl}
                    alt={product.name} />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{product.name}</h2>
                <p className="description">{product.description}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">Buy Now</button>
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
