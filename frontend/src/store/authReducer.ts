import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { customAxios, setAccessTokenInAxiosHeaders, removeAccessTokenFromAxiosHeaders } from "../utils/customAxios.ts";
import type { User } from "../types/User";

// Récupérer le refreshToken depuis sessionStorage au démarrage
const getInitialRefreshToken = (): string | undefined => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('refreshToken') || undefined;
  }
  return undefined;
};

export interface AuthStateProps {
  isLogin?: boolean
  user?: User
  refreshToken?: string
  // accessToken stocké uniquement en mémoire (headers Axios), jamais en localStorage
}

const initialState: AuthStateProps = {
  isLogin: false,
  refreshToken: getInitialRefreshToken()
}

export const login = createAsyncThunk<{accessToken: string, refreshToken: string, user: User}, { email: string; password: string }>(
  "auth/login",
  async (payload) => {
    return customAxios.post(`/api/user/login`, payload).then((data) => {
      return data.data
    })
  }
)

export const refreshAccessToken = createAsyncThunk<{accessToken: string, refreshToken: string}, void>(
  "auth/refreshToken",
  async (_, { getState }) => {
    const state = getState() as { auth: { refreshToken?: string } };
    // Essayer d'abord depuis le state, puis depuis sessionStorage
    let refreshToken = state.auth.refreshToken;
    
    if (!refreshToken && typeof window !== 'undefined') {
      refreshToken = sessionStorage.getItem('refreshToken') || undefined;
    }
    
    if (!refreshToken) {
      throw new Error("Aucun refresh token disponible");
    }
    
    return customAxios.post(`/api/user/refresh`, { refreshToken }).then((data) => {
      return data.data
    })
  }
)

export const logoutUser = createAsyncThunk<void, void>(
  "auth/logout",
  async (_, { getState }) => {
    const state = getState() as { auth: { refreshToken?: string } };
    const refreshToken = state.auth.refreshToken || 
      (typeof window !== 'undefined' ? sessionStorage.getItem('refreshToken') : null);
    
    // Appeler l'API pour révoquer le refreshToken côté serveur
    if (refreshToken) {
      try {
        await customAxios.post(`/api/user/logout`, { refreshToken });
      } catch (error) {
        // Continuer même si l'appel échoue (déjà déconnecté, etc.)
        console.error("Erreur lors de la déconnexion côté serveur:", error);
      }
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      removeAccessTokenFromAxiosHeaders()
      state.isLogin = false
      state.user = undefined
      state.refreshToken = undefined
      // Nettoyer sessionStorage si utilisé (mais pas localStorage pour les tokens)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('refreshToken')
      }
    }
  }, 
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        // Stocker accessToken uniquement en mémoire (headers Axios)
        setAccessTokenInAxiosHeaders(action.payload.accessToken)
        // RefreshToken : optionnellement en sessionStorage (plus sécurisé que localStorage)
        // sessionStorage est effacé à la fermeture de l'onglet, contrairement à localStorage
        state.refreshToken = action.payload.refreshToken
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('refreshToken', action.payload.refreshToken)
        }
        state.user = action.payload.user
        state.isLogin = true
        console.log("login successful")
      })
      .addCase(login.rejected, (state) => {
        state.isLogin = false
        state.refreshToken = undefined
        console.log("login failed")
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        // Mettre à jour les tokens après refresh
        setAccessTokenInAxiosHeaders(action.payload.accessToken)
        state.refreshToken = action.payload.refreshToken
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('refreshToken', action.payload.refreshToken)
        }
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // Si le refresh échoue, déconnecter l'utilisateur
        removeAccessTokenFromAxiosHeaders()
        state.isLogin = false
        state.user = undefined
        state.refreshToken = undefined
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('refreshToken')
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        // Après la déconnexion réussie côté serveur, nettoyer le state
        removeAccessTokenFromAxiosHeaders()
        state.isLogin = false
        state.user = undefined
        state.refreshToken = undefined
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('refreshToken')
        }
      })
      .addCase(logoutUser.rejected, (state) => {
        // Même en cas d'erreur, nettoyer le state côté client
        removeAccessTokenFromAxiosHeaders()
        state.isLogin = false
        state.user = undefined
        state.refreshToken = undefined
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('refreshToken')
        }
      })
  },
  selectors: {
    isAuthUserId: (state, userId?: number) => {
      return state.user?.id == userId
    }
  }
})

export default authSlice.reducer
export const authSelector = authSlice.selectors
export const authActions = authSlice.actions