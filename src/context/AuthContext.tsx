import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import axios from "../api/config";
import type { User, AuthContextType } from "../types/Auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Lỗi lấy thông tin user:", err);
      localStorage.removeItem("token");
      setUser(null);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await login(token);
        } catch {
          // Token không hợp lệ -> user = null
        }
      }
      setLoading(false); //chỉ set false sau khi đã xử lý xong
    };
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
