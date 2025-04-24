// instance.js
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API,
});

// Request Interceptor: Gắn token vào header
instance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (hoặc sessionStorage, Redux,...)
    const token = localStorage.getItem('token'); 
    if (token) {
      // Thêm Authorization header (Bearer token)
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 🔒 Unauthorized: maybe token expired or invalid
      window.location.href = '/#/unauthorized';
      // Optional: return a custom error
      return Promise.reject({ message: "Unauthorized" });
    }

    return Promise.reject(error);
  }
);
export default instance;
