import React, {useState} from 'react';
import {Link} from "react-router-dom";
import Navbar from '../../components/Navbar.jsx';
import toast from 'react-hot-toast';
import ProductCard from "../../components/ProductCard";
import useFetchProducts from "../../components/actions/useFetchProducts";
import Hero from "../../components/Hero";
import Cookies from "js-cookie";
import UserInfo from "../../components/UserInfo.jsx";
import AddressCard from '../../components/AddressCard.jsx';

const AddressesPage = () => {

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
                    <AddressCard/>)
                </div>
            </div>
        </div>
    )
}

export default AddressesPage;


