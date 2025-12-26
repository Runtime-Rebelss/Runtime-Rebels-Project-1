import {Link} from "react-router-dom";
import React, {useState} from "react";
import toast from "react-hot-toast";
import {ShoppingBag, Trash2} from "lucide-react";
import {addToCart} from "../lib/cart";
import Cookies from "js-cookie"
import addressService from "../lib/addresses";

const AddressCard = ({address}) => {
    const [isDefault, setIsDefault] = useState(false);
    const [isOther, setIsOther] = useState(false);
    const [isUnit, setIsUnit] = useState(false);
    const addressId = address?.id || address?._id || "";
    const userId = Cookies.get("userId");
    const [showConfirm, setShowConfirm] = useState(false);

    const handleIsDefaultChange = () => {
        setIsDefault(isDefault);
    }

    const handleIsUnitChange = () => {
        setIsUnit(!isUnit);
    }

    // Need backend code to make the default address change in database

    const removeAddresses = async () => {
        try {
            await addressService.removeAddress(addressId);
            toast.success("Address removed.");
        } catch (error) {
            toast.error("Failed to remove address.");
        }
    }

    // Default button - When clicked set the address as default and then when another address
    // is clicked as default, the previous default is unset

    return (
        <div className="card card-border bg-base-200 shadow-sm transition duration-200 justify-center w-full">
            {/* DEFAULT ADDRESS */}
            {isDefault && (
                <div className="card-body flex flex-col justify-between ">
                    <h2 className="card-title text-base-content mb-1">Default</h2>
                    <p>
                        <Link to={`/address/${addressId}`}>{address.address}</Link>
                    </p>
                    <p>
                        <Link
                            to={`/address/${addressId}`}>{address.city + ", " + address.state + " " + address.zipCode}</Link>
                    </p>
                    <p>
                        {/* Need to remove the space */}
                        {!isUnit && (
                            <Link to={`/address/${addressId}`}>{address.unit}</Link>)}
                    </p>
                    <p>
                        <Link to={`/address/${addressId}`}>{address.zipCode}</Link>
                    </p>
                    <div className="card-actions justify-end">
                        <button className="mt-auto flex justify-center gap-3">Edit</button>
                        <button className="btn btn-soft btn-error rounded-full flex items-center gap-1 px-4">Remove
                        </button>
                    </div>
                </div>
            )}
            {/* NOT DEFAULT ADDRESS */}
            {!isDefault && (
                <div className="card-body flex flex-col justify-between">
                    <h2 className="card-title text-base-content mb-1">Card Title</h2>
                    <p>
                        <Link to={`/address/${addressId}`}>{address.address}</Link>
                    </p>
                    <p>
                        <Link
                            to={`/address/${addressId}`}>{address.city + ", " + address.state + " " + address.zipCode}</Link>
                    </p>
                    <p>
                        {/* Need to remove the space */}
                        {!isUnit && (
                            <Link to={`/address/${addressId}`}>{address.unit}</Link>)}
                    </p>
                    <p>
                        <Link to={`/address/${addressId}`}>{address.zipCode}</Link>
                    </p>
                    <div className="card-actions justify-front">
                        {/* Need an edit backend thing */}
                        <button className="mt-auto btn btn-primary flex justify-center">Edit</button>
                        {/* Need the remove backend code here */}
                        <button onClick={() => setShowConfirm(true)}
                                className="btn btn-primary flex items-center gap-1 px-4">Remove
                        </button>
                        {/* When set as default and then another address is clicked to be default, the previous default is unset */}
                        <button onClick={handleIsDefaultChange} className="btn btn-primary">Set as Default</button>
                    </div>
                </div>
            )}

            {/* CONFIRM DELETE MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
                        <h3 className="text-lg font-semibold">
                            Are you sure?
                        </h3>
                        <p className="text-sm mt-2">
                            This action cannot be undone.
                        </p>

                        <div className="mt-4 flex justify-center gap-3">
                            <button
                                className="btn btn-soft"
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-error" onClick={removeAddresses}>
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddressCard;