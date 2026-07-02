import axiosInstance from "@/shared/api/axiosInstance";
import { LeaderboardEntry } from "../types";

export const leaderboardApi = {
  getTop: async () => {
    const response = await axiosInstance.get<LeaderboardEntry[]>("/leaderboard");
    return response.data;
  },
};
