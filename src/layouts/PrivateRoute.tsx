import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface PrivateRouterProps {
  adminOnly?: boolean;
}

export default function PrivateRouter({ adminOnly = false }: PrivateRouterProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-10">🔄 Đang xác thực người dùng...</div>;
  }

  if (!user) {
    return <Navigate to="/recruitments" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/recruitments" replace />;
  }

  return <Outlet />; 
}
