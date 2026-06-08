import axios from "axios";

const normalizeBaseUrl = (value) => {
  if (!value) {
    return "/api";
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export const http = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("hd-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
