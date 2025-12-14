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
		return response.data;
	},

	login: async (data: LoginRequest): Promise<AuthResponse> => {
		const response = await api.post("/login", data);
		return response.data;
	},

	logout: async (): Promise<{ message: string }> => {
		const response = await api.post("/logout");
		return response.data;
	},

	getUser: async (): Promise<UserResponse> => {
		const response = await api.get("/user");
		return response.data;
	},

	refreshToken: async (): Promise<{ token: string; token_type: string }> => {
		const response = await api.post("/refresh");
		return response.data;
	},
};

export default authAPI;
