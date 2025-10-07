import axios from "axios";

const API_BASE_URL = "https://localhost:7212/api";

const instance = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor thêm token tự động
instance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});


export { API_BASE_URL };
export default instance;
