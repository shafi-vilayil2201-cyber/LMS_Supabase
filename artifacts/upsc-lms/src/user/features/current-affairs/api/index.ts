import axiosInstance from "@/shared/api/axiosInstance";
import { NewsItem } from "../types";

export const newsApi = {
  getAll: async () => {
    const response = await axiosInstance.get<NewsItem[]>("/current-affairs");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<NewsItem>(`/current-affairs/${id}`);
    return response.data;
  },
};
