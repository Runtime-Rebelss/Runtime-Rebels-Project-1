import React, {useEffect, useState} from 'react'
import Navbar from '../../components/Navbar.jsx';
import toast from 'react-hot-toast';
import AddressCard from '../../components/AddressCard2.jsx';
import api from "../../lib/axios.js";
import Cookies from "js-cookie";
import CheckoutAddresses from "../../components/CheckoutAddresses.jsx";

const CheckoutAddressPage = () => {
    const [address, setAddress] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = Cookies.get("userId");

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const response = await api.get(`/address/user/${userId}`);
                setAddress(response.data);
            } catch (error) {
                console.error("Error fetching address:", error);
                toast.error("Failed to load address!");
            } finally {
                setLoading(false);
            }
        };
        fetchAddress();
    }, [userId]);

    const defaultFirst = address.slice();

    // When button "set default" is clicked, move that address to the front of the list
    defaultFirst.sort((a, b) => b.default - a.default);

    return (
        <div>
            <Navbar/>
            <div className="container mx-auto px-4 py-8">
                <div className='flex justify-between items-center mt-4 relative'>
                    <h1 className="text-3xl font-bold mb-6 text-center">Checkout - Address</h1>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
                    {defaultFirst.map(addr => (
                        <CheckoutAddresses key={addr.id} address={addr} isDefault={addr.default} isCheckout={true}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CheckoutAddressPage;