/**
 * Centralized API client for Majedaar Customer App.
 * Uses fetch with credentials: "include" for HttpOnly cookie session management.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message, status = 500, errors = null, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = Array.isArray(errors) ? errors : null;
    this.data = data;
  }

  /**
   * Helper to get map of field -> message for inline form validation
   */
  getFieldErrors() {
    if (!this.errors) return {};
    return this.errors.reduce((acc, curr) => {
      if (curr.field) acc[curr.field] = curr.message;
      return acc;
    }, {});
  }
}

/**
 * Universal request wrapper for backend communication.
 *
 * @param {string} endpoint - API path, e.g. "/customer-auth/login" or "/menu"
 * @param {Object} options - fetch options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const headers = { ...(options.headers || {}) };
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && options.body && typeof options.body === "object") {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    headers,
    credentials: "include", // Required for HttpOnly customer_token cookie
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    const contentType = response.headers.get("content-type");
    let json = null;

    if (contentType && contentType.includes("application/json")) {
      try {
        json = await response.json();
      } catch {
        json = null;
      }
    }

    if (!response.ok) {
      let errorMessage = "";

      // 1. First parse structured Zod validation errors if available
      if (json && Array.isArray(json.errors) && json.errors.length > 0) {
        errorMessage = json.errors
          .map((e) => (typeof e === "string" ? e : e.message || String(e)))
          .filter(Boolean)
          .join(". ");
      } else if (json && typeof json.message === "string" && json.message.trim()) {
        errorMessage = json.message.trim();
      }

      // 2. If message is generic "Validation failed" or missing, use clean HTTP status messaging
      if (!errorMessage || errorMessage.toLowerCase() === "validation failed") {
        switch (response.status) {
          case 400:
            errorMessage = "Invalid request. Please check your entries.";
            break;
          case 401:
            errorMessage = "Your session has expired. Please sign in again.";
            break;
          case 403:
            errorMessage = "Access denied. You do not have permission.";
            break;
          case 404:
            errorMessage = "The requested item or page was not found.";
            break;
          case 409:
            errorMessage = "A conflict occurred with this request. Please refresh and try again.";
            break;
          case 422:
            errorMessage = "Unable to process the submitted data. Please verify your details.";
            break;
          case 429:
            errorMessage = "Too many requests. Please wait a moment before trying again.";
            break;
          case 500:
          default:
            errorMessage = "Something went wrong on our end. Please try again shortly.";
            break;
        }
      }

      throw new ApiError(
        errorMessage,
        response.status,
        json?.errors || null,
        json?.data || null
      );
    }

    return json;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network / connection error
    throw new ApiError(
      "Unable to connect to the restaurant server. Please check your internet connection.",
      0
    );
  }
}
