import api from "./axios";

export interface LoginRequest {
	phone: string;
	password: string;
}

export interface ChangePasswordRequest {
	old_password: string;
	new_password: string;
}

export interface AuthResponse {
	user: {
		id: number;
		name: string;
		phone: string;
		email?: string;
		role: "admin" | "user" | "editor";
		must_change_password: boolean;
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
	role: "admin" | "user" | "editor";
	must_change_password: boolean;
	created_at: string;
	updated_at: string;
}

export const authAPI = {
	login: async (data: LoginRequest): Promise<AuthResponse> => {
		const response = await api.post("/auth/login", data);
		return response.data.data;
	},

	logout: async (): Promise<{ message: string }> => {
		const response = await api.post("/auth/logout");
		return { message: response.data.message };
	},

	getMe: async (): Promise<UserResponse> => {
		const response = await api.get("/auth/me");
		return response.data.user;
	},

	changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
		const response = await api.post("/change_password", data);
		return { message: response.data.message };
	},
};

export default authAPI;
