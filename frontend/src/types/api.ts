/**
 * API Response Types
 * These types match the backend ResponseTrait format
 */

/**
 * Standard API response structure from backend
 */
export interface ApiResponse<T = unknown> {
	result: boolean;
	status: number;
	message: string;
	data?: T;
	[key: string]: unknown; // Allow dynamic keys like "user", "patients", etc.
}

/**
 * Normalized error structure for frontend use
 */
export interface ApiError {
	status: number;
	message: string;
	errors?: ValidationErrors;
}

/**
 * Validation errors from Laravel (422 responses)
 */
export type ValidationErrors = Record<string, string[]>;

/**
 * User data structure
 */
export interface User {
	id: number;
	name: string;
	email: string | null;
	phone: string;
	role: string;
	created_at: string;
	updated_at: string;
}

/**
 * Auth response structure
 */
export interface AuthResponse {
	token: string;
	user: User;
}

/**
 * Patient data structure
 */
export interface Patient {
	id: number;
	user_id: number;
	name: string;
	ssn: string;
	age: number | null;
	phone: string | null;
	martial_status: "single" | "married" | "divorced" | "widowed" | null;
	status: "pending" | "complete" | null;
	children: number | null;
	governorate: string | null;
	address: string | null;
	diagnosis: string | null;
	solution: string | null;
	cost: number;
	created_at: string;
	updated_at: string;
	user?: Pick<User, "id" | "name" | "phone" | "email">;
}

/**
 * Pagination meta data
 */
export interface PaginationMeta {
	current_page: number;
	from: number | null;
	last_page: number;
	per_page: number;
	to: number | null;
	total: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
	current_page: number;
	data: T[];
	first_page_url: string;
	last_page: number;
	last_page_url: string;
	next_page_url: string | null;
	per_page: number;
	prev_page_url: string | null;
	total: number;
}
