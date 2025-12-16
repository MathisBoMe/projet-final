import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { customAxios, setAccessTokenInAxiosHeaders } from "../utils/customAxios.ts";
import type { User } from "../types/User";

export interface AuthStateProps {
  isLogin?: boolean
  user?: User
}

const initialState: AuthStateProps = {
  isLogin: false
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state) => {
      state.isLogin = true
    },
    logout: (state) => {
      state.isLogin = false
    }
  }, extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        setAccessTokenInAxiosHeaders(action.payload.token)
        state.user = action.payload.user
        state.isLogin = true
        console.log("login successful")
      })
      .addCase(login.rejected, (state) => {
        state.isLogin = false
        console.log("login failed")
      })
  },
  selectors: {
    isAuthUserId: (state, userId?: number) => {
      return state.user?.id == userId
    }
  }
})

export const login = createAsyncThunk<string, { email: string; password: string }>(
  "auth/login",
  async (payload) => {
    return customAxios.post(`/api/user/login`, payload).then((data) => {
      return data.data
    })
  }
)

export default authSlice.reducer
export const authSelector = authSlice.selectors
export const authActions = authSlice.actions