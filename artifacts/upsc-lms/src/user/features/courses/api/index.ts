import axiosInstance from "@/shared/api/axiosInstance";
import { Course, WeeklyBlock } from "../types";

export const coursesApi = {
  getAll: async () => {
    const response = await axiosInstance.get<Course[]>("/courses");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<Course>(`/courses/${id}`);
    return response.data;
  },
  getWeeklyBlocks: async (courseId: string) => {
    const response = await axiosInstance.get<WeeklyBlock[]>(`/courses/${courseId}/weeks`);
    return response.data;
  },
  enroll: async (courseId: string) => {
    const response = await axiosInstance.post(`/courses/${courseId}/enroll`);
    return response.data;
  },
};
