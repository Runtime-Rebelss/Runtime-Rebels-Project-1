import {Link} from "react-router-dom";
import React, {useState} from "react";
import toast from "react-hot-toast";
import addressService from "../lib/addresses";
import Cookies from "js-cookie";

const AddressCard2 = ({address, isDefault = false}) => {
    const [isUnit, setIsUnit] = useState(false);
    const addressId = address?.id || address?._id || "";
    const [showConfirm, setShowConfirm] = useState(false);

    // Need backend code to make the default address change in database
    const setAsDefaultAddress = async () => {
        try {
            // Call backend to set this address as default
            toast.success("Address set as default.");
            await addressService.setDefaultAddress(addressId);
        } catch (error) {
            toast.error("Failed to set as default address.");
        }
    }

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
    // Need to call the backend

    return (
        <div className="card card-border bg-base-200 shadow-sm transition duration-200">
            {/* DEFAULT ADDRESS */}
            {isDefault && (
                <div className="card-body flex flex-col justify-between">
                    <h2 className="card-title text-base-content mb-1">Default</h2>
                    <div className="">{Cookies.get("fullName")}</div>
                    <div>
                        <Link to={`/address/${addressId}`}>{address.address}</Link>
                    </div>
                    <div>
                        <Link
                            to={`/address/${addressId}`}>{address.city + ", " + address.state + " " + address.zipCode}</Link>
                    </div>
                    <div>
                        {/* Need to remove the space */}
                        {!isUnit && (
                            <Link to={`/address/${addressId}`}>{address.unit}</Link>)}
                    </div>
                    <div>
                        <Link to={`/address/${addressId}`}>{address.country}</Link>
                    </div>
                    <div className="mt-auto flex justify-front gap-2">
                        {/* Need an edit backend thing */}
                        <button className="mt-auto btn btn-primary flex justify-center">Edit</button>
                        {/* REMOVE ADDRESS */}
                        <button onClick={() => setShowConfirm(true)}
                                className="btn btn-primary flex items-center gap-1 px-4">Remove
                        </button>
                    </div>
                </div>
            )}
            {/* NOT DEFAULT ADDRESS */}
            {!isDefault && (
                <div className="card-body flex flex-col justify-between">
                    <h2 className="card-title text-base-content mb-1"></h2>
                    <div className="">{Cookies.get("fullName")}</div>
                    <div>
                        <Link to={`/address/${addressId}`}>{address.address}</Link>
                    </div>
                    <div>
                        <Link
                            to={`/address/${addressId}`}>{address.city + ", " + address.state + " " + address.zipCode}</Link>
                    </div>
                    <div>
                        {/* Need to remove the space */}
                        {!isUnit && (
                            <Link to={`/address/${addressId}`}>{address.unit || ""}</Link>)}
                    </div>
                    <div>
                        <Link to={`/address/${addressId}`}>{address.country}</Link>
                    </div>
                    <div>
                        <Link to={`/address/${addressId}`}>{address.phoneNumber}</Link>
                    </div>
                    <div className="mt-auto flex justify-center gap-2">
                        {/* Need an edit backend thing */}
                        <button className="mt-auto btn btn-primary flex justify-center">Edit</button>
                        {/* Need the remove backend code here */}
                        <button onClick={() => setShowConfirm(true)}
                                className="btn btn-primary flex items-center gap-1 px-4">Remove
                        </button>
                        {/* When set as default and then another address is clicked to be default, the previous default is unset */}
                        <button onClick={setAsDefaultAddress} className="btn btn-primary">Set as Default</button>
                    </div>
                </div>
            )}
            {/* CONFIRM DELETE MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
                        <h3 className="text-lg font-semibold">
                            Remove this address?
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

export default AddressCard2;