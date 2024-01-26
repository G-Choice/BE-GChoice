import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token for user logout',
    example: 'your_refresh_token_here',
  })
  @IsNotEmpty()
  refreshToken: string;
}
