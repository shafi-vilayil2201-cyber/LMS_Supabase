import axiosInstance from "@/shared/api/axiosInstance";
import { MentorStats } from "../types";

export const mentorDashboardApi = {
  getStats: async () => {
    const response = await axiosInstance.get<MentorStats>("/mentor/stats");
    return response.data;
  },
};
