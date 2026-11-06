import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword(
    { minLength: 5, minLowercase: 1, minUppercase: 1, minSymbols: 0 },
    {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter and at least 5 characters.',
    },
  )
  password!: string;
}
