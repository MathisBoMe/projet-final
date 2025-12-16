import { customAxios } from "../utils/customAxios.ts";

export const RealisateurService = {
  async create(data) {
    return customAxios.post(`/api/realisateur`, data)
      .then((response) => response.data)
  },
  async getAll() {
    return customAxios.get(`/api/realisateur`)
      .then((response) => response.data)
  }
}