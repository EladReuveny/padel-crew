import { api } from "../../../lib/config/api.config";
import { PublicUser } from "../../users/types/users.types";
import type { LoginUserDto, RegisterUserDto } from "../types/auth.types";

const RESOURCE_PATH = "auth";

export const authApi = {
  register: async (data: RegisterUserDto): Promise<PublicUser> => {
    const response = await api.post<PublicUser>(`${RESOURCE_PATH}/register`, data);
    return response.data;
  },

  login: async (data: LoginUserDto): Promise<PublicUser> => {
    const response = await api.post<PublicUser>(`${RESOURCE_PATH}/login`, data);
    return response.data;
  },

  getMe: async (): Promise<PublicUser> => {
    const response = await api.get<PublicUser>(`${RESOURCE_PATH}/me`);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`${RESOURCE_PATH}/logout`);
    return response.data;
  },
};
