/**
 * API Interface
 *
 * This file defines the contract for API communication.
 * Implement these interfaces to integrate with any backend:
 * - REST API (fetch)
 * - GraphQL (Apollo, URQL)
 * - tRPC
 * - Convex
 * - Supabase
 */

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

// Error structure
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// HTTP methods
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Request options
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: unknown;
}

// API client interface
export interface ApiClient {
  get: <T>(url: string, options?: RequestOptions) => Promise<ApiResponse<T>>;
  post: <T>(url: string, options?: RequestOptions) => Promise<ApiResponse<T>>;
  put: <T>(url: string, options?: RequestOptions) => Promise<ApiResponse<T>>;
  patch: <T>(url: string, options?: RequestOptions) => Promise<ApiResponse<T>>;
  delete: <T>(url: string, options?: RequestOptions) => Promise<ApiResponse<T>>;

  // Set auth token for authenticated requests
  setAuthToken: (token: string | null) => void;
}

// API configuration
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}
