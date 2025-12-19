import axios, { AxiosError } from "axios";

export const customAxios = axios.create({
  baseURL: 'http://localhost:3000'
})

// Stocker la fonction de refresh pour l'intercepteur
let refreshTokenFn: (() => Promise<void>) | null = null;

export function setRefreshTokenCallback(callback: () => Promise<void>) {
  refreshTokenFn = callback;
}

export function setAccessTokenInAxiosHeaders(token: string) {
  customAxios.defaults.headers.common.Authorization = `Bearer ${token}`
}

export function removeAccessTokenFromAxiosHeaders() {
  delete customAxios.defaults.headers.common.Authorization
}

// Intercepteur pour gérer les erreurs 401 et refresh automatique
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

customAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si erreur 401 et pas déjà en train de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Attendre que le refresh soit terminé
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return customAxios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Essayer de refresh le token
        if (refreshTokenFn) {
          await refreshTokenFn();
          processQueue(null);
          return customAxios(originalRequest);
        } else {
          throw new Error("Aucune fonction de refresh disponible");
        }
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        // Rediriger vers login si le refresh échoue
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);