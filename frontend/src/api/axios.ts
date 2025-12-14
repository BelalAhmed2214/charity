import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:8000/api",
	withCredentials: true,
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

const processQueue = (error?: Error) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.onError(error);
		}
	});

	failedQueue = [];
};

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

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
					"http://localhost:8000/api/refresh",
					{},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
							Accept: "application/json",
						},
					}
				);

				const newToken = response.data.token;
				localStorage.setItem("auth_token", newToken);
				api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
				originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

				processQueue();
				return api(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError as Error);
				localStorage.removeItem("auth_token");
				window.location.href = "/login";
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);

export default api;
