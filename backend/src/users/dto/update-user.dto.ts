import { IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsStrongPassword(
    { minLength: 5, minLowercase: 1, minUppercase: 1, minSymbols: 0 },
    {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter and at least 5 characters.',
    },
  )
  @IsOptional()
  password?: string;

  @IsString()
  @IsStrongPassword(
    { minLength: 5, minLowercase: 1, minUppercase: 1, minSymbols: 0 },
    {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter and at least 5 characters.',
    },
  )
  @IsOptional()
  confirmPassword?: string;
}
