import React, { useEffect, useState } from 'react'
import {Link} from "react-router-dom";
import Navbar from '../../components/Navbar.jsx';
import { useParams, useNavigate } from 'react-router'
import toast from 'react-hot-toast';
import AddressCard from '../../components/AddressCard.jsx';
import addressService from "../../lib/addresses.js";
import api from "../../lib/axios.js";
import Cookies from "js-cookie";

const AddressesPage = () => {
    const [address, setAddress] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = Cookies.get("userId");

    useEffect(() => {
        const fetchAddress = async () => {
                    try {
                        const response = await api.get(`/address/user/${userId}`);
                        setAddress(response.data);
                    } catch (error) {
                        console.log("addressId:", addressId);
                        console.error("Error fetching address:", error);
                        toast.error("Failed to load address!");
                    } finally {
                        setLoading(false);
                    }
                };
                fetchAddress();
            }, []);
    return (
        <div>
            <Navbar/>
            <div className="container mx-auto px-4 py-8">
                <div className='flex justify-between items-center mt-4 relative'>
                    <h1 className="text-3xl font-bold mb-6 text-center">Your Addresses</h1>
                    <Link
                        to="/account/add/address"
                        className="btn rounded-full px-8 py-3 text-lg font-semibold bg-neutral text-white hover:bg-neutral-focus transition-all shadow"
                    >
                        Add Address
                    </Link>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {address.map(addr => (
                        <AddressCard key={addr.id} address={addr} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AddressesPage;


