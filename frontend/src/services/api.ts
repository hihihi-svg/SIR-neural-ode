import axios from "axios";

const isLocalhost = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || 
   window.location.hostname === "127.0.0.1" || 
   window.location.hostname.includes("192.168."));

const api = axios.create({
    baseURL: isLocalhost ? "http://localhost:8001/api" : "/_/backend/api"
});

export default api;
