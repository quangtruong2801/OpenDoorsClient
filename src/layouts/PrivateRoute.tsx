import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface PrivateRouterProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

export default function PrivateRouter({ children, adminOnly = false }: PrivateRouterProps) {
  const { user, loading } = useAuth();

  // Khi đang loading thì hiển thị màn hình chờ
  if (loading) {
    return <div className="text-center p-10">🔄 Đang xác thực người dùng...</div>;
  }

  // Nếu chưa đăng nhập
  if (!user) {
    return <Navigate to="/recruitments" replace />;
  }

  // Nếu yêu cầu admin mà user không phải admin
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/recruitments" replace />;
  }

  return children;
}
