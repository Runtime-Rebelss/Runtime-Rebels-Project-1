import { Link } from "react-router";
import React from "react";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";

import api from "../lib/axios";

function ProductCard({ product }) {



    return (
        <Link to={`/product/${product.id}`}
            className='card bg-base-200 shadow-sm hover:shadow-lg transition-all duration-200'
        >
            <figure className="w-full h-full flex items-center justify-center object-contain overflow-hidden">
                <img class="w-full h-full flex p-4 lg:object-contain md:object-contain sm:object-contain"
                    src={product.imageUrl}
                    alt={product.name} />
            </figure>
            <div className="card-body flex-auto">
                <h2 className="card-title flex text-base-content">{product.name}</h2>
                <div className="card-actions flex justify-between items-center mt-4 relative"> {/*lg:absolute lg:bottom-4 lg:right-4 lg:flex lg:flex-col lg:items-end lg:gap-2*/}
                    <div className="font-normal text-2xl">${Number(product.price).toFixed(2)}
                    </div>
                    <button className="btn btn-soft btn-primary rounded-full gap-2">
                        <ShoppingBag />
                        <span>Add to Bag</span>
                    </button>
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
