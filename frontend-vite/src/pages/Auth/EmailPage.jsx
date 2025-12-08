import RestPassword from "../../components/ResetPassword";
import Navbar from "../../components/Navbar.jsx";
import Email from "../../components/Email.jsx";

const RestPasswordPage = () => {
    return (
        <div className="min-h-screen bg-base-200">
            <Navbar/>
            <div className="flex justify-center py-16">
                <Email/>
            </div>
        </div>
    )
}

export default RestPasswordPage;