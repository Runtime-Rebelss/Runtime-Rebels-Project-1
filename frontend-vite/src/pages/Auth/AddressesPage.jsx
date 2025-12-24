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
                    <h1 className="text-3xl font-bold mb-6 text-center">Your Addresses</h1>
                </div>
                <div className="breadcrumbs text-sm">
                    <ul>
                        <li><a href="http://localhost:5173/account">Your Account</a></li>
                        <li><a href="http://localhost:5173/account/addresses">Your Addresses</a></li>
                    </ul>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
                    <div className="card bg-base-200">
                        <Link
                            to="/account/add/address"
                            className="justify-center items-center h-full btn btn-ghost"
                        >
                            Add Address
                        </Link>
                    </div>
                    {defaultFirst.map(addr => (
                        <AddressCard key={addr.id} address={addr} isDefault={addr.default}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AddressesPage;


