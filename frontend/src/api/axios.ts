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

let isRefreshing = false;
let failedQueue: Array<{
	onSuccess: (token: string) => void;
	onError: (error: Error) => void;
}> = [];

const processQueue = (token?: string, error?: Error) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.onError(error);
		} else if (token) {
			prom.onSuccess(token);
		}
	});
	failedQueue = [];
};

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Handle 401 errors with token refresh
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((onSuccess, onError) => {
					failedQueue.push({ onSuccess, onError });
				})
					.then((token) => {
						originalRequest.headers["Authorization"] = `Bearer ${token}`;
						return api(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const response = await axios.post(
					`${
						import.meta.env.VITE_API_URL || "http://localhost:8000/api"
					}/refresh`,
					{},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
							Accept: "application/json",
						},
					}
				);

				const newToken = response.data.data?.token || response.data.token;
				localStorage.setItem("auth_token", newToken);
				api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
				originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

				processQueue(newToken);
				return api(originalRequest);
			} catch (refreshError) {
				processQueue(undefined, refreshError as Error);
				localStorage.removeItem("auth_token");
				window.location.href = "/login";
				return Promise.reject(normalizeApiError(refreshError));
			} finally {
				isRefreshing = false;
			}
		}

		// Normalize all errors before rejecting
		return Promise.reject(normalizeApiError(error));
	}
);

export default api;
