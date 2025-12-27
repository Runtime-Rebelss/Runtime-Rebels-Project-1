import React, {useEffect, useState} from 'react'
import {Link} from "react-router-dom";
import Navbar from '../../components/Navbar.jsx';
import {useParams, useNavigate} from 'react-router'
import toast from 'react-hot-toast';
import AddressCard from '../../components/AddressCard2.jsx';
import addressService from "../../lib/addresses.js";
import api from "../../lib/axios.js";
import Cookies from "js-cookie";

const AddressesPage = () => {
    const [address, setAddress] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = Cookies.get("userId");
    const [isDefault, setIsDefault] = useState(false);

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

    return (
        <div>
            <Navbar/>
            <div className="container mx-auto px-4 py-8">
                <div className='flex justify-between items-center mt-4 relative'>
                    <h1 className="text-3xl font-bold mb-6 text-center">Your Addresses</h1>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
                    <div className="card bg-base-200">
                    <Link
                        to="/account/add/address"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center items-center h-full btn btn-ghost"
                    >
                        Add Address
                    </Link>
                    </div>
                    {address.map(addr => (
                        <AddressCard key={addr.id} address={addr} isDefault={addr.default}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AddressesPage;


