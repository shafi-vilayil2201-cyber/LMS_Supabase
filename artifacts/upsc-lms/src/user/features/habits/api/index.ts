import axiosInstance from "@/shared/api/axiosInstance";
import { DailyHabit } from "../types";

export const habitsApi = {
  getByDate: async (date: string) => {
    const response = await axiosInstance.get<DailyHabit>(`/habits/${date}`);
    return response.data;
  },
  update: async (habit: Partial<DailyHabit>) => {
    const response = await axiosInstance.put<DailyHabit>(`/habits/${habit.date}`, habit);
    return response.data;
  },
  getHistory: async () => {
    const response = await axiosInstance.get<DailyHabit[]>("/habits/history");
    return response.data;
  },
};
