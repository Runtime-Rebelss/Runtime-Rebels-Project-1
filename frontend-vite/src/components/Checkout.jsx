import React, {useState} from "react";

const Checkout = () => {
    const [showCheckoutPrompt, setShowCheckoutPrompt] = useState(false);

    return (
        showCheckoutPrompt && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
                    <h2 className="text-xl font-semibold">
                        Members get free shipping on orders $50+
                    </h2>
                    <p className="text-base-content/70">
                        Sign in to save your cart and enjoy exclusive member benefits.
                    </p>

                    <div className="flex flex-col gap-2 mt-4">
                        <button
                            className="btn btn-primary w-full"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                        <button
                            className="btn btn-outline w-full"
                            onClick={() => navigate("/signup")}
                        >
                            Sign Up
                        </button>
                        <button
                            className="btn btn-neutral w-full"
                            onClick={() => {
                                setShowCheckoutPrompt(false);
                                checkoutLib.handleCheckout();
                            }}
                        >
                            Continue as Guest
                        </button>
                    </div>
                    <button
                        className="btn btn-sm btn-ghost mt-3"
                        onClick={() => setShowCheckoutPrompt(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )
    )
}

export default Checkout;


