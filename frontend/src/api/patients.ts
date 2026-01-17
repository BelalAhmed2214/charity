import axios from './axios';
import type { ApiResponse, Patient, PaginatedResponse } from '../types/api';

const BASE_URL = '/patients';

export interface PatientFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const patientsApi = {
  /**
   * Get all patients with optional filtering and pagination
   * Note: Backend currently returns a simple array (filtering/pagination commented out)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAll: async (filters: PatientFilters = {}) => {
    const params = {
      page: filters.page,
      per_page: filters.per_page,
      search: filters.search,
      status: filters.status,
      sort_by: filters.sort_by,
      direction: filters.sort_order, // Backend expects 'direction', frontend uses 'sort_order'
    };
    const response = await axios.get<ApiResponse & { patients: PaginatedResponse<Patient> }>(BASE_URL, { params });
    return response.data;
  },

  /**
   * Get a single patient by ID
   */
  get: async (id: number) => {
    const response = await axios.get<ApiResponse & { patient: Patient }>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new patient
   */
  create: async (data: Partial<Patient>) => {
    const response = await axios.post<ApiResponse<{ patient: Patient }>>(BASE_URL, data);
    return response.data;
  },

  /**
   * Update an existing patient
   */
  update: async (id: number, data: Partial<Patient>) => {
    const response = await axios.put<ApiResponse<{ patient: Patient }>>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a patient
   */
  delete: async (id: number) => {
    const response = await axios.delete<ApiResponse<null>>(`${BASE_URL}/${id}`);
    return response.data;
  }
};
