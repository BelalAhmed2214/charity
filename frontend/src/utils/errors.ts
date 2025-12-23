import axios, { AxiosError } from "axios";
import type { ApiError, ValidationErrors } from "@/types/api";

/**
 * Normalize an error from an API call into a consistent ApiError structure
 */
export function normalizeApiError(error: unknown): ApiError {
	// Handle Axios errors
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError<unknown>;

		if (axiosError.response) {
			const { status } = axiosError.response;
			const data = axiosError.response.data as
				| {
						message?: string;
						errors?: ValidationErrors;
				  }
				| undefined;

			// Check if response has our standard format
			if (data && typeof data === "object") {
				return {
					status: status || 500,
					message: data.message ?? getDefaultMessage(status),
					errors: data.errors,
				};
			}

			// Fallback for non-standard responses
			return {
				status: status || 500,
				message: getDefaultMessage(status),
			};
		}

		// Network error (no response)
		if (axiosError.request) {
			return {
				status: 0,
				message: "Network error. Please check your connection.",
			};
		}
	}

	// Handle non-Axios errors
	if (error instanceof Error) {
		return {
			status: 500,
			message: error.message || "An unexpected error occurred",
		};
	}

	// Unknown error type
	return {
		status: 500,
		message: "An unexpected error occurred",
	};
}

/**
 * Get a user-friendly error message from an ApiError
 */
export function getErrorMessage(error: ApiError): string {
	return error.message || getDefaultMessage(error.status);
}

/**
 * Check if an error has validation errors
 */
export function hasValidationErrors(error: ApiError): boolean {
	return !!(error.errors && Object.keys(error.errors).length > 0);
}

/**
 * Get field-level errors as a flat object (first error per field)
 */
export function getFieldErrors(error: ApiError): Record<string, string> {
	if (!error.errors) return {};

	const fieldErrors: Record<string, string> = {};

	for (const [field, messages] of Object.entries(error.errors)) {
		if (messages && messages.length > 0) {
			fieldErrors[field] = messages[0];
		}
	}

	return fieldErrors;
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: number): string {
	switch (status) {
		case 400:
			return "Bad Request";
		case 401:
			return "Unauthorized";
		case 403:
			return "Forbidden";
		case 404:
			return "Not Found";
		case 422:
			return "Validation Error";
		case 500:
			return "Server Error";
		case 503:
			return "Service Unavailable";
		default:
			return `Error ${status}`;
	}
}

/**
 * Get default error message based on status code
 */
function getDefaultMessage(status?: number): string {
	switch (status) {
		case 400:
			return "Bad request. Please check your input.";
		case 401:
			return "You are not authenticated. Please log in.";
		case 403:
			return "You do not have permission to perform this action.";
		case 404:
			return "The requested resource was not found.";
		case 422:
			return "Validation failed. Please check your input.";
		case 500:
			return "A server error occurred. Please try again later.";
		case 503:
			return "Service temporarily unavailable. Please try again later.";
		default:
			return "An error occurred. Please try again.";
	}
}
