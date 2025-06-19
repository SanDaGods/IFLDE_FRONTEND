// src/utils/api.js

// Ensure no trailing slash in base URL
const API_BASE_URL = "https://iflde-backend-production.up.railway.app".replace(/\/+$/, "");

// Inject auth token if available
const beforeRequest = (config) => {
  const token = localStorage.getItem("authToken");

  config.headers = {
    "Content-Type": "application/json",
    ...config.headers,
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // Always include credentials (cookies, sessions)
  config.credentials = "include";

  return config;
};

// Handle API responses
const afterResponse = async (response) => {
  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    try {
      error.data = await response.json();
    } catch {
      error.data = await response.text();
    }
    throw error;
  }
  return response.json();
};

// Core API wrapper
const apiClient = async (endpoint, options = {}) => {
  try {
    const config = beforeRequest(options);
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, config);
    return await afterResponse(response);

  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);

    if (error.status === 401) {
      window.location.href = "/login";
    }

    throw {
      message: error.message || "Network error",
      status: error.status || 500,
      data: error.data || null,
    };
  }
};

// Shortcut methods
const get = (endpoint, options) => apiClient(endpoint, { ...options, method: "GET" });
const post = (endpoint, body, options) => apiClient(endpoint, { ...options, method: "POST", body: JSON.stringify(body) });
const put = (endpoint, body, options) => apiClient(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) });
const patch = (endpoint, body, options) => apiClient(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) });
const del = (endpoint, options) => apiClient(endpoint, { ...options, method: "DELETE" });

// Export for usage
export default {
  get,
  post,
  put,
  patch,
  delete: del,
  raw: apiClient,
};
