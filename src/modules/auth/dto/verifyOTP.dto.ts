import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: "User's email address",
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'One-time password (OTP) for verification',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  otp: string;
}
