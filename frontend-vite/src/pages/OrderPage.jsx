import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import api from "../lib/axios";

const OrderPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar/>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="card bg-base-100 border border-base-300">
                        <div className="card-body p-0">
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                    <tr>
                                        {/* Date goes here */}
                                        <th>Order Placed</th>

                                        <th className="w-40">Total</th>

                                        <th className="text-right">Ship to</th>

                                        <th></th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default OrderPage;