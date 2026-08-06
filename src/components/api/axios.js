import axios from "axios";

const API_BASE_URL = "https://studentappbackend-1.onrender.com/api"; // Replace with your API base URL
export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const storedId = localStorage.getItem("studentID");
    if (storedId) {
      config.headers["student-id"] = storedId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (response.data?.isDeleted === true) {
      localStorage.removeItem("studentID");
      window.location.href = "/";
      return Promise.reject(new Error("Account deleted"));
    }
    return response;
  },
  (error) => {
    if (
      error.response?.data?.isDeleted === true ||
      error.response?.data?.message === "Student not found"
    ) {
      localStorage.removeItem("studentID");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;
