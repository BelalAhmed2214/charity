import api from "./axios";

export interface User {
	id: number;
	name: string;
	phone: string;
	email?: string;
	role: "admin" | "user" | "editor";
	created_at: string;
	updated_at: string;
}

export interface CreateUserRequest {
	name: string;
	phone: string;
	email?: string;
	password: string;
	role: "admin" | "user" | "editor"; // Backend expects lowercase
}

export interface UpdateUserRequest {
	name?: string;
	email?: string;
	role?: "admin" | "user" | "editor"; // Backend expects lowercase
	password?: string;
}

export interface UsersResponse {
	data: User[];
	meta?: {
		current_page: number;
		per_page: number;
		total: number;
		last_page: number;
	};
}

export const usersAPI = {
	getAll: async (page = 1, limit = 10): Promise<UsersResponse> => {
		const response = await api.get("/users", {
			params: { page, limit },
		});
		// Backend returns { users: [...] } via ResponseTrait
		return { data: response.data.users || [] };
	},

	getById: async (id: number): Promise<User> => {
		const response = await api.get(`/users/${id}`);
		return response.data.user;
	},

	create: async (data: CreateUserRequest): Promise<User> => {
		const response = await api.post("/users", data);
		// Backend returns { data: { user: {...} } }
		return response.data.data?.user || response.data.user;
	},

	update: async (id: number, data: UpdateUserRequest): Promise<User> => {
		const response = await api.put(`/users/${id}`, data);
		return response.data.user;
	},

	delete: async (id: number): Promise<{ message: string }> => {
		const response = await api.delete(`/users/${id}`);
		return response.data;
	},
};

export default usersAPI;
