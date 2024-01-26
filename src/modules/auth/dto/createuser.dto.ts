import { IsEmail, IsNotEmpty, Length, NotContains } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: "User's username",
    example: 'john_doe',
  })
  @IsNotEmpty()
  @NotContains(' ', { message: "Username shouldn't contain white spaces" })
  username: string;

  @ApiProperty({
    description: "User's email address",
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User's phone number",
    example: '123456789',
  })
  @IsNotEmpty()
  number_phone: string;

  @ApiProperty({
    description: "User's password",
    minLength: 6,
    maxLength: 20,
  })
  @Length(6, 20)
  password: string;
}
