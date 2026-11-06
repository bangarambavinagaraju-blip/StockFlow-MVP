import axios from "axios";

// Automatically switch between local and deployed backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// Automatically attach JWT to protected API requests
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem("stockflow_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    error => Promise.reject(error)
);

// Handle expired or invalid authentication
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem("stockflow_token");
            localStorage.removeItem("stockflow_user");

            if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/signup"
            ) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;