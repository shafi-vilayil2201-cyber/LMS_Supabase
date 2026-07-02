import axiosInstance from "@/shared/api/axiosInstance";
import { Mentor, Session } from "../types";

export const mentorsApi = {
  getAll: async () => {
    const response = await axiosInstance.get<Mentor[]>("/mentors");
    return response.data;
  },
  getSessions: async () => {
    const response = await axiosInstance.get<Session[]>("/sessions");
    return response.data;
  },
  bookSession: async (mentorId: string, details: any) => {
    const response = await axiosInstance.post("/sessions", { mentorId, ...details });
    return response.data;
  },
};
