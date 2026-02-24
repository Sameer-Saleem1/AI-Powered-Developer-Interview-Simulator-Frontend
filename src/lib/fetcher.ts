import { z } from "zod";

/**
 * Custom fetcher that automatically attaches the JWT token from localStorage.
 * Replaces the default TanStack Query fetcher for authenticated routes.
 */
export async function fetchApi<T>(
  url: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers });

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
    throw new Error(errorMessage);
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
}
