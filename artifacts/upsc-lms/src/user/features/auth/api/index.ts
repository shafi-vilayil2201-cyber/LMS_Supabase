import axiosInstance from "@/shared/api/axiosInstance";
import { LoginCredentials, RegisterCredentials, User } from "../types";

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await axiosInstance.post<{ user: User; token: string }>("/auth/login", credentials);
    return response.data;
  },
  register: async (credentials: RegisterCredentials) => {
    const response = await axiosInstance.post<{ user: User; token: string }>("/auth/register", credentials);
    return response.data;
  },
  me: async () => {
    const response = await axiosInstance.get<User>("/auth/me");
    return response.data;
  },
};
