import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import Navbar from '../components/Navbar';
import cartLib from "../lib/cart.js";
import api from "../lib/axios.js";
import toast from "react-hot-toast";
import Cookies from "js-cookie"

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showCheckoutPrompt, setShowCheckoutPrompt] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [isGuest, setIsGuest] = useState(false);

    const navigate = useNavigate();
    const userId = Cookies.get("userId");

    return (
        <div></div>
    )
}
