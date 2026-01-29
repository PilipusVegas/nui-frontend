// src/utils/jwtHelper.js

export function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json);

    const currentTime = Math.floor(Date.now() / 1000);
    if (data.exp && currentTime >= data.exp) {
      console.warn("Token expired. Removing from localStorage...");
      localStorage.removeItem("token");
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
}


/**
 * Melakukan fetch dengan Authorization Bearer JWT dari localStorage
 * @param {string} url - endpoint API
 * @param {object} options - opsi fetch tambahan (method, headers, body, dll)
 * @returns {Promise<Response>} hasil fetch
 */

  function isTokenExpired(token) {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      const data = JSON.parse(json);
  
      const currentTime = Math.floor(Date.now() / 1000);
      return data.exp && currentTime >= data.exp;
    } catch {
      return true;
    }
  }
  
  export async function fetchWithJwt(url, options = {}) {
    const token = localStorage.getItem('token');
  
    if (token && isTokenExpired(token)) {
      console.warn("Token expired. Removing from localStorage...");
      localStorage.removeItem('token');
      return Promise.reject(new Error("Token expired"));
    }
  
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    };
  
    const config = {
      ...options,
      headers,
    };
  
    return fetch(url, config);
  }