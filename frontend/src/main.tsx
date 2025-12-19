import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App.tsx";
import { store } from "./store/store.ts";
import { Provider } from "react-redux";
import { initializeAuth } from "./utils/authInit.ts";
import { setRefreshTokenCallback } from "./utils/customAxios.ts";
import { refreshAccessToken } from "./store/authReducer.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      //select: data => Array.isArray(data) ? data : [data]
    }
  }
})

// Configurer le callback de refresh pour l'intercepteur Axios
setRefreshTokenCallback(async () => {
  const state = store.getState() as { auth: { refreshToken?: string } };
  const refreshToken = state.auth.refreshToken || 
    (typeof window !== 'undefined' ? sessionStorage.getItem('refreshToken') : null);
  
  if (!refreshToken) {
    throw new Error("Aucun refresh token disponible");
  }

  const result = await store.dispatch(refreshAccessToken()).unwrap();
  return result;
});

// Initialiser l'authentification au démarrage
initializeAuth().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <App />
    </Provider>
  </QueryClientProvider>
)
