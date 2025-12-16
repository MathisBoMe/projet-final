import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authReducer.ts";

export const store = configureStore({
  reducer: combineReducers({
    auth: authReducer,
  }),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
    thunk: true
  })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch