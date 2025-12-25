import { Link } from "react-router-dom";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag, Trash2 } from "lucide-react";
import { addToCart } from "../lib/cart";
import Cookies from "js-cookie"
import { deleteProduct } from "../lib/products";

const AddressCard = ({ address }) => {
    const [isDefault, setIsDefault] = useState(false);

    const handleIsDefaultChange = () => {
        setIsDefault(!isDefault);
    }

    return (
        <div className="card card-border bg-base-200 shadow-sm transition duration-200 flex w-96">
            {/* DEFAULT ADDRESS */}
            {isDefault && (
            <div className="card-body flex flex-col justify-between">
                <h2 className="card-title text-base-content mb-1">Default</h2>
                <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">Edit</button>
                    <button className="btn btn-primary">Remove</button>
                </div>
            </div>
            )}
            {/* NOT DEFAULT ADDRESS */}
            {!isDefault && (
                <div className="card-body flex flex-col justify-between">
                <h2 className="card-title text-base-content mb-1">Card Title</h2>
                <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
                <div className="card-actions justify-end">
                <button className="btn btn-primary">Edit</button>
                <button className="btn btn-primary">Remove</button>
                <button onClick={handleIsDefaultChange} className="btn btn-primary">Set as Default</button>
                </div>
            </div>
            )}
        </div>
    )
}

export default AddressCard;