import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

const ProtectedRoute = () => {
    return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;