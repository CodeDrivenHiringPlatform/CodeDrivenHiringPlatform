import axios from "axios";

const api = axios.create({
   baseURL: "http://localhost:9090/api",
  // baseURL: "http://192.168.1.112:9090/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

export default api;