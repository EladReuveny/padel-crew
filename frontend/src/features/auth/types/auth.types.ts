export type UserRole = "USER" | "ADMIN";

export type RegisterUserDto = {
  email: string;
  password: string;
};

export type LoginUserDto = {
  email: string;
  password: string;
};
