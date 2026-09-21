const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message, status = 500, errors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Universal request wrapper for backend API calls.
 * Always passes credentials: "include" for HttpOnly session cookie authentication.
 */
export async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, headers = {}, ...customConfig } = options;

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const requestHeaders = { ...headers };
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (!isFormData && body && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const config = {
    method,
    headers: requestHeaders,
    credentials: "include",
    ...customConfig,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new ApiError(
      "Unable to connect to the server. Please check your internet connection or backend server status.",
      0
    );
  }

  // Parse JSON response safely
  let payload = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    const errors = payload?.errors || null;
    throw new ApiError(message, response.status, errors);
  }

  return payload;
}
