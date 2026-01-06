import {Link, useNavigate} from "react-router-dom";
import React, {useState} from "react";
import addressService from "../lib/addresses";
import Cookies from "js-cookie";

const CheckoutAddresses = ({address, addresses = []}) => {
    const navigate = useNavigate();
    const [isUnit, setIsUnit] = useState(false);
    const addressId = address?.id || address?._id || "";
    const [showConfirm, setShowConfirm] = useState(false);
    const [isVis, setIsVis] = useState(false);
    const userId = Cookies.get("userId");
    const [loading, setLoading] = useState(false);

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

    const defaultFirst = addresses.slice();

    // When button "set default" is clicked, move that address to the front of the list
    defaultFirst.sort((a, b) => b.default - a.default);

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
            {isVis && (
                <div className="collapse collapse-open bg-base-100 border border-base-300">
                    <input type="checkbox" name="my-accordion-2"/>
                    <div className="collapse-title font-semibold">Select a Delivery Address</div>
                    <button onClick={() => setIsVis(false)} className="btn btn-ghost btn-xs">Cancel</button>
                    <div className="collapse-content text-sm">
                        <ul>
                            {defaultFirst.map((addr, index) => (
                                <React.Fragment key={addr.id || addr._id}>
                                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                                        <input type="radio"
                                               name="delivery-address"
                                               className="radio radio-accent"
                                               defaultChecked={addr.default || index === 0}
                                               />
                                        <div className="flex flex-col">
                                            <li className="flex font-semibold items-center">{addr?.name || fullName}</li>
                                            {/* ADDRESS LINE - Need to map it here */}
                                            <li className="flex items-center">{renderAddressLine(addr)}</li>
                                            <li className="flex items-center">Phone
                                                number: {addressService.formatPhoneNumber(addr?.phoneNumber || "N/A")}</li>
                                            <button className="link link-hover flex" onClick={() => setShowConfirm(true)}>Edit Address</button>
                                        </div>
                                    </label>
                                </React.Fragment>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {/* CONFIRM DELETE MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
                        <h3 className="text-lg font-semibold">
                            Show Edit Address Pop up
                        </h3>
                        <div className="mt-4 flex justify-center gap-3">
                            <button
                                className="btn btn-soft"
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-error">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default CheckoutAddresses;