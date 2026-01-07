import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {ShoppingBag} from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../lib/axios";
import orderLib from "../../lib/orders.js";
import orderService from "../../lib/orderService";
import Cookies from "js-cookie"
import UserInfo from "../../components/UserInfo";
import ResetPassword from "../../components/ResetPassword.jsx";

const UserInfoPage = () => {
    return (
        <div className="min-h-screen bg-base-200">
            <Navbar/>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-6 flex items-center justify-center">
                    Login & Security
                </h1>
                <div className="container mx-auto px-4 py-8">
                    <UserInfo/>
                    {/* UPDATE PASSWORD */}
                    <ResetPassword/>
                </div>
            </div>
        </div>
    )
}

export default UserInfoPage;

{/*Use form to allow user to enter inputs in, then use that input to change the db email, password, etc*/}
