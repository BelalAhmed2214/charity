import api from "./axios";
import type { ApiResponse } from "@/types/api";

export interface Stats {
	completed_patients: number;
	pending_patients: number;
	total_patients: number;
	total_costs?: number;
	avg_cost_per_patient?: number;
	cost_trend?: Array<{ date: string; total: number }>;
}

export const statsApi = {
	get: async () => {
		const response = await api.get<ApiResponse & { stats: Stats }>("/stats");
		return response.data.stats;
	},
};
