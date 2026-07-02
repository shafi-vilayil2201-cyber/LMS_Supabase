import axiosInstance from "@/shared/api/axiosInstance";
import { UserProfile } from "../types";

export const profileApi = {
  get: async () => {
    const response = await axiosInstance.get<UserProfile>("/profile");
    return response.data;
  },
  update: async (profile: Partial<UserProfile>) => {
    const response = await axiosInstance.put<UserProfile>("/profile", profile);
    return response.data;
  },
};
