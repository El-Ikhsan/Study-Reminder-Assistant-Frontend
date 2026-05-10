import axios from "axios";
import Cookies from "js-cookie";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to get tokens
export const getAccessToken = () => Cookies.get("accessToken");
export const getRefreshToken = () => Cookies.get("refreshToken");

// Helper to set tokens
export const setTokens = (accessToken: string, refreshToken: string) => {
  // Set access token (expires in 1 day for client side storage convenience, though actual expiry is handled by JWT)
  Cookies.set("accessToken", accessToken, { expires: 1, secure: true, sameSite: "strict" });
  // Set refresh token (expires in 7 days)
  Cookies.set("refreshToken", refreshToken, { expires: 7, secure: true, sameSite: "strict" });
};

// Helper to clear tokens
export const clearTokens = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
};

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't intercept refresh token failures themselves, otherwise infinite loop
      if (originalRequest.url.includes("/auth/refresh") || originalRequest.url.includes("/auth/login")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, null, {
          headers: {
            "X-Refresh-Token": refreshToken,
          },
        });

        if (refreshResponse.data.success) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          // Note: Backend might also return a new refresh token, but API_DOC.md only shows accessToken being returned
          // Update the access token cookie
          Cookies.set("accessToken", newAccessToken, { expires: 1, secure: true, sameSite: "strict" });

          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
