import { z } from "zod";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, ""); // Remove trailing slash

// Debug: Log the API URL on module load
console.log(
  "[Fetcher] API_URL configured as:",
  API_URL || "(empty - using relative URLs)",
);

/**
 * Custom fetcher that automatically attaches the JWT token from localStorage.
 * Replaces the default TanStack Query fetcher for authenticated routes.
 */
export async function fetchApi<T>(
  url: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>,
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    !headers.has("Content-Type") &&
    options.body &&
    typeof options.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Construct full URL by prepending API_URL to relative paths
  const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;

  console.log(`[API Request] ${options.method || "GET"} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
      mode: "cors",
      credentials: "omit",
    });

    console.log(`[API Response] ${res.status} ${fullUrl}`);

    if (!res.ok) {
      // Auto-logout on 401 Unauthorized
      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
      }

      const errorText = await res.text();
      let errorMessage = "An error occurred";
      try {
        const parsed = JSON.parse(errorText);
        errorMessage = parsed.message || parsed.error || errorText;
      } catch {
        errorMessage = errorText || res.statusText;
      }
      console.error(`[API Error] ${res.status} ${fullUrl}:`, errorMessage);
      throw new Error(`${res.status}: ${errorMessage}`);
    }

    if (res.status === 204) return {} as T;

    const data = await res.json();

    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        console.error("[Zod Validation Error]", result.error.format());
        throw new Error("Invalid response format from server");
      }
      return result.data;
    }

    return data;
  } catch (error) {
    // Network errors or other fetch failures
    if (error instanceof Error && error.message.includes("fetch")) {
      console.error(`[Network Error] Failed to connect to ${fullUrl}`, error);
      throw new Error(
        `Unable to connect to server. Please check if the backend is running.`,
      );
    }
    throw error;
  }
}
