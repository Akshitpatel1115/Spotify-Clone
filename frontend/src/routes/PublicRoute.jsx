import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/useAuth";

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
