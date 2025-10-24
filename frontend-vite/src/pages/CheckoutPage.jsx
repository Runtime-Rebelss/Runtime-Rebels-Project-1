import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import Navbar from '../components/Navbar';
import cartLib from '../lib/cart';
import checkoutImage from '../assets/Scamazon_Coming_Soon.png';
const CheckoutPage = () => {
    return (<div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 flex items-center justify-center">
        <img src={checkoutImage} alt="Checkout Page"
                 className="max-w-sm w-full h-auto object-contain"
        />
        </div>
        </div>
    )
}

export default CheckoutPage;