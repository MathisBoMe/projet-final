import axios from "axios";

export const customAxios = axios.create({
  baseURL: 'http://localhost:3000'
})

export function setAccessTokenInAxiosHeaders(token: string) {
  customAxios.defaults.headers.common.Authorization = `Bearer ${token}`
}

export function removeAccessTokenFromAxiosHeaders() {
  delete customAxios.defaults.headers.common.Authorization
}