import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least 1 uppercase letter',
  })
  @Matches(/(?=.*[!@#$%^&*()-+])/, {
    message: 'Password must contain at least 1 special character',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Password must contain at least 1 number',
  })
  password: string;
}
