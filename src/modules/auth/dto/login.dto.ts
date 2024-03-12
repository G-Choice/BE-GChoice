import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class loginUserDto {
  @ApiProperty({
    description: "User's email address",
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: "User's password",
    example: 'secure_password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  fcmToken:string;
}
