/**
 * Initialisation de l'authentification au démarrage
 * Récupère le refreshToken depuis sessionStorage et configure l'intercepteur
 */

import { store } from "../store/store.ts";
import { refreshAccessToken } from "../store/authReducer.ts";
import { setRefreshTokenCallback, setAccessTokenInAxiosHeaders } from "./customAxios.ts";

/**
 * Initialise l'authentification au démarrage de l'application
 * Récupère le refreshToken depuis sessionStorage et tente de récupérer un accessToken
 */
export async function initializeAuth() {
  // Récupérer le refreshToken depuis sessionStorage
  const refreshToken = typeof window !== 'undefined' 
    ? sessionStorage.getItem('refreshToken') 
    : null;

  if (refreshToken) {
    try {
      // Configurer le callback de refresh pour l'intercepteur Axios
      setRefreshTokenCallback(async () => {
        const state = store.getState() as { auth: { refreshToken?: string } };
        const currentRefreshToken = state.auth.refreshToken || sessionStorage.getItem('refreshToken');
        
        if (!currentRefreshToken) {
          throw new Error("Aucun refresh token disponible");
        }

        const result = await store.dispatch(refreshAccessToken()).unwrap();
        return result;
      });

      // Tenter de récupérer un nouvel accessToken avec le refreshToken
      const result = await store.dispatch(refreshAccessToken()).unwrap();
      setAccessTokenInAxiosHeaders(result.accessToken);
      
      return true;
    } catch (error) {
      // Si le refresh échoue, nettoyer sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('refreshToken');
      }
      return false;
    }
  }

  return false;
}
