import axios from "axios";
import { BACKEND_API_URL } from "../utils/api";

// Vendor-scoped Axios instance that reads vendorToken fresh each call
const vendorApi = axios.create({
  baseURL: BACKEND_API_URL,
});

vendorApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendorToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers && config.headers.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

export default vendorApi;


