import axiosInstance from "@/shared/api/axiosInstance";
import { Announcement } from "../types";

export const adminAnnouncementsApi = {
  getAll: async () => {
    const response = await axiosInstance.get<Announcement[]>("/admin/announcements");
    return response.data;
  },
  create: async (announcement: Partial<Announcement>) => {
    const response = await axiosInstance.post<Announcement>("/admin/announcements", announcement);
    return response.data;
  },
  delete: async (id: string) => {
    await axiosInstance.delete(`/admin/announcements/${id}`);
  },
};
