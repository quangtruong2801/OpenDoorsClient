import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "antd/dist/reset.css";
import "./i18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//Tạo một instance QueryClient
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/*Bọc toàn bộ App bằng QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
