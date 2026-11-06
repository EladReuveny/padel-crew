export type User = {
  id: string;
  email: string;
  username: string;
  hashPassword: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRole = "USER" | "ADMIN";

export type PublicUser = Omit<User, "hashPassword">;

export type UpdateUserDto = {
  password?: string;
  confirmPassword?: string;
};
