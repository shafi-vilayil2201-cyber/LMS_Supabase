import axiosInstance from "@/shared/api/axiosInstance";
import { AdminStats } from "../types";

export const adminDashboardApi = {
  getStats: async () => {
    const response = await axiosInstance.get<AdminStats>("/admin/stats");
    return response.data;
  },
};
