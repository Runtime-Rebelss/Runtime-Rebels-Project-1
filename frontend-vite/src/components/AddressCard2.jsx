import {Link} from "react-router-dom";
import React, {useState} from "react";
import toast from "react-hot-toast";
import addressService from "../lib/addresses";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";

const AddressCard2 = ({address, isDefault = false, isCheckout = true}) => {
    const navigate = useNavigate();
    const [isUnit, setIsUnit] = useState(false);
    const addressId = address?.id || address?._id || "";
    const [showConfirm, setShowConfirm] = useState(false);

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
            // Check if isDefault is true!!
            if (isDefault) {
                toast.error("Please set another address as default before removing this one.");
                setShowConfirm(false);
                return;
            }
            await addressService.removeAddress(addressId);
            toast.success("Address removed.");
        } catch (error) {
            toast.error("Failed to remove address.");
        }
    }

    return (
        <div className="card card-border bg-base-200 shadow-sm transition duration-200">
            {/* DEFAULT ADDRESS */}
            {isDefault && (
                <div className="card-body flex flex-col justify-between">
                    <h2 className="card-title text-base-content mb-1">Default</h2>
                    <div className="">{address.name}</div>
                    <li className="flex items-center">
                        {address.address}
                    </li>
                    <li className="flex items-center">
                        {address.state != null ? (
                            address.city + ", " + address.state + " " + address.zipCode
                        ) : (
                            address.city + ", " + address.zipCode)}
                    </li>
                    <li className="flex items-center">
                        {/* Need to remove the space */}
                        {address.unit > 0 && (address.unit) ?
                            address.unit :
                        <div></div>}
                    </li>
                    <li className="flex items-center">
                        {address.country}
                    </li>
                    <li className="flex items-center">
                        Phone Number:&nbsp;{addressService.formatPhoneNumber(address.phoneNumber)}
                    </li>
                    <div className="mt-auto flex justify-front gap-2">
                        {/* EDIT ADDRESS */}
                        <button className="mt-auto btn btn-primary flex justify-center"
                                onClick={() => navigate(`/account/edit/address/${addressId}`)}
                        >
                            Edit
                        </button>
                        {/* REMOVE ADDRESS */}
                        <button onClick={() => removeAddresses()}
                                className="btn btn-primary flex items-center gap-1 px-4">Remove
                        </button>
                    </div>
                </div>
            )}
            {/* NOT DEFAULT ADDRESS */}
            {!isDefault && (
                <div className="card-body flex flex-col justify-between">
                    <h2 className="card-title text-base-content mb-1"></h2>
                    <div className="">{address.name}</div>
                    <li className="flex items-center">
                        {address.address}
                    </li>
                    <li className="flex items-center">
                        {address.state != null ? (
                            address.city + ", " + address.state + " " + address.zipCode
                        ) : (
                            address.city + ", " + address.zipCode)}
                    </li>
                        {/* Need to remove the space */}
                        {address.unit && (
                            <li className="flex items-center">
                                {address.unit}
                            </li>
                        )}
                            <li className="flex items-center">
                        {address.country}
                    </li>
                    <li className="flex items-center">
                        Phone Number:&nbsp;{addressService.formatPhoneNumber(address.phoneNumber)}
                    </li>
                    <div className="mt-auto flex justify-center gap-2">
                        {/* EDIT ADDRESS */}
                        <button className="mt-auto btn btn-primary flex justify-center"
                                onClick={() => navigate(`/account/edit/address/${addressId}`)}
                        >
                            Edit
                        </button>
                        {/* REMOVE ADDRESS */}
                        <button onClick={() => setShowConfirm(true)}
                                className="btn btn-primary flex items-center gap-1 px-4">Remove
                        </button>
                        {/* SET AS DEFAULT ADDRESS */}
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