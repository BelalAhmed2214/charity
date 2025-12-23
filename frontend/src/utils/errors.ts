import axios, { AxiosError } from "axios";
import type { ApiError, ValidationErrors } from "@/types/api";
import i18n from "@/i18n";

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
				message: i18n.t("errors.network"),
			};
		}
	}

	// Handle non-Axios errors
	if (error instanceof Error) {
		return {
			status: 500,
			message: error.message || i18n.t("errors.unexpected"),
		};
	}

	// Unknown error type
	return {
		status: 500,
		message: i18n.t("errors.unexpected"),
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
			return i18n.t("errors.status.400");
		case 401:
			return i18n.t("errors.status.401");
		case 403:
			return i18n.t("errors.status.403");
		case 404:
			return i18n.t("errors.status.404");
		case 422:
			return i18n.t("errors.status.422");
		case 500:
			return i18n.t("errors.status.500");
		case 503:
			return i18n.t("errors.status.503");
		default:
			return i18n.t("errors.status.default", { status });
	}
}

/**
 * Get default error message based on status code
 */
function getDefaultMessage(status?: number): string {
	switch (status) {
		case 400:
			return i18n.t("errors.default.400");
		case 401:
			return i18n.t("errors.default.401");
		case 403:
			return i18n.t("errors.default.403");
		case 404:
			return i18n.t("errors.default.404");
		case 422:
			return i18n.t("errors.default.422");
		case 500:
			return i18n.t("errors.default.500");
		case 503:
			return i18n.t("errors.default.503");
		default:
			return i18n.t("errors.default.general");
	}
}
