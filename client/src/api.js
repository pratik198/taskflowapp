import axios from "axios";

const API = axios.create({
    baseURL: "https://taskflowapp-1-gy8v.onrender.com/api",
});

// Attach token automatically if present
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers["x-auth-token"] = token;
    }
    return req;
});

export default API;
