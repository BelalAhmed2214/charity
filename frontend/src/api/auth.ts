import api from "./axios";

export interface LoginRequest {
	phone: string;
	password: string;
}

export interface RegisterRequest {
	name: string;
	phone: string;
	email?: string;
	password: string;
	password_confirmation: string;
}

export interface AuthResponse {
	user: {
		id: number;
		name: string;
		phone: string;
		email?: string;
		created_at: string;
		updated_at: string;
	};
	token: string;
	token_type: string;
}

export interface UserResponse {
	id: number;
	name: string;
	phone: string;
	email?: string;
	created_at: string;
	updated_at: string;
}

export const authAPI = {
	register: async (data: RegisterRequest): Promise<AuthResponse> => {
		const response = await api.post("/register", data);
		// ResponseTrait wraps data in { result, message, status, data: {...} }
		return response.data.data;
	},

	login: async (data: LoginRequest): Promise<AuthResponse> => {
		const response = await api.post("/login", data);
		// ResponseTrait wraps data in { result, message, status, data: {...} }
		return response.data.data;
	},

	logout: async (): Promise<{ message: string }> => {
		const response = await api.post("/logout");
		// ResponseTrait returns { result, message, status, data: [] }
		return { message: response.data.message };
	},

	getUser: async (): Promise<UserResponse> => {
		const response = await api.get("/user");
		// ResponseTrait wraps data in { result, message, status, user: {...} }
		return response.data.user;
	},

	refreshToken: async (): Promise<{ token: string; token_type: string }> => {
		const response = await api.post("/refresh");
		// ResponseTrait wraps data in { result, message, status, data: {...} }
		return response.data.data;
	},
};

export default authAPI;
