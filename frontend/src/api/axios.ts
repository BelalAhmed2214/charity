import axios from "axios";
import { normalizeApiError } from "@/utils/errors";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// Add authorization header if token exists
const token = localStorage.getItem("auth_token");
if (token) {
	api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}



api.interceptors.response.use(
	(response) => response,
	async (error) => {


		// Handle 401 errors
		if (error.response?.status === 401) {
			localStorage.removeItem("auth_token");
			delete api.defaults.headers.common["Authorization"];
			window.location.href = "/login";
		}

		// Normalize all errors before rejecting
		return Promise.reject(normalizeApiError(error));
	}
);

export default api;
