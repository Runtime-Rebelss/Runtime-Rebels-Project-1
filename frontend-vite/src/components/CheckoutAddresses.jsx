import {Link} from "react-router-dom";
import React, {useState} from "react";
import toast from "react-hot-toast";
import addressService from "../lib/addresses";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";

const CheckoutAddresses = ({address, isDefault = false, isCheckout = true}) => {
    const navigate = useNavigate();
    const [isUnit, setIsUnit] = useState(false);
    const addressId = address?.id || address?._id || "";
    const [showConfirm, setShowConfirm] = useState(false);
    const [isVis, setIsVis] = useState(false);

    const toggleVisibility = () => {
        setIsVis(!isVis);
    }

    const fullName = Cookies.get("fullName");

    const defaultFirst = address.slice();

    // When button "set default" is clicked, move that address to the front of the list
    defaultFirst.sort((a, b) => b.default - a.default);

    useEffect(() => {
        const userId = Cookies.get("userId");
        if (!userId) return;

        let cancelled = false;
        (async () => {
            try {
                const resp = await addressService.getAddressesByUserId(userId);
                const addrs = resp?.data ?? [];
                const def = addrs.find(a => a?.isDefault || a?.is_default || a?.default) || addrs[0] || null;
                if (!cancelled) setAddress(def);
            } catch (err) {
                console.warn("Failed to load addresses", err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

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
        <div>
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
        </div>
            )
    }



export default CheckoutAddresses;