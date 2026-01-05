import {useNavigate, Link} from "react-router-dom";
import React, {useState} from "react";

import addressService from "../lib/addresses";
import Cookies from "js-cookie";

const CheckoutAddresses = ({address, isDefault = false, isCheckout = true}) => {
    const navigate = useNavigate();
    const [isUnit, setIsUnit] = useState(false);
    const addressId = address?.id || address?._id || "";
    const [showConfirm, setShowConfirm] = useState(false);
    const [isVis, setIsVis] = useState(false);
    const userId = Cookies.get("userId");

    const toggleVisibility = () => {
        setIsVis(!isVis);
    }

    const fullName = Cookies.get("fullName");

    const renderAddressLine = (addr) => {
        if (!addr) return null;
        const address = addr.address || "";
        const city = addr.city || "";
        const state = addr.state || "";
        const zip = addr.zipCode || "";
        const country = addr.country || "";

        const parts = [address, city, state, zip, country].filter(Boolean);
        return parts.join(', ');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* DELIVERY NAME */}
            {!isVis &&
                <>
                    <div className="flex justify-between items-center ">
                        <h1 className="text-xl font-bold">Delivering to {address?.name || fullName}</h1>
                        <button className="link link-hover link-accent flex-end" onClick={toggleVisibility}>Change
                        </button>
                    </div>
                    {/* DELIVERY ADDRESS */}
                    <div className='flex items-center'>
                        {address ? (
                            <div className="mb-4">
                                {renderAddressLine(address)}
                            </div>
                        ) : (
                            <div className="mb-4 text-sm text-base-content/60">
                                No delivery address set. <Link to="/account/add/address" className="underline">Add an
                                address</Link> to prefill checkout.
                            </div>
                        )}
                    </div>
                </>
            }
            {/* CHANGE ADDRESS - COLLAPSIBLE - Create a map here for it */}
            {isVis &&
                <div className="collapse collapse-open bg-base-100 border border-base-300">
                    <input type="checkbox" name="my-accordion-2"/>
                    <div className="collapse-title font-semibold">Select a Delivery Address</div>
                    <div className="collapse-content text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="account-choice" className="radio radio-accent"/>
                            <div className="flex flex-col">
                                <li className="flex font-semibold items-center">{address?.name || fullName}</li>
                                {/* ADDRESS LINE - Need to map it here */}
                                <li className="flex items-center">{renderAddressLine(address)}</li>
                                <li className="flex items-center">Phone
                                    number: {addressService.formatPhoneNumber(address?.phoneNumber || "N/A")}</li>
                            </div>
                        </label>
                    </div>
                </div>
            }
        </div>
    )
}


export default CheckoutAddresses;