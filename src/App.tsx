// App.tsx
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import { ConfigProvider, theme } from "antd";
import { useEffect, useState } from "react";

export default function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
          borderRadius: 8,
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes isDark={isDark} setIsDark={setIsDark} />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
