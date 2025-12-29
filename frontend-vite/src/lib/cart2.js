import api from "./axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie"
import cartLib from "./cart.js";

const GUEST_KEY = "guestCart";
const userId = Cookies.get("userId");

