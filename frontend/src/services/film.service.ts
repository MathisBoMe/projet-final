import { customAxios } from "../utils/customAxios.ts";

export const FilmService = {
  async create(data) {
    return customAxios.post(`/api/film`, data)
  },
  async getAll() {
    const response = await customAxios.get(`/api/film`)
    return response.data
  },
  async getById(id) {
    const response = await customAxios.get(`/api/film/${id}`)
    return response.data
  }
}