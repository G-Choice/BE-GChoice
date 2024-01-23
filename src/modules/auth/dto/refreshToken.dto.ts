import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokensDto {
  @ApiProperty({
    description: 'The refresh token to be used for token refresh',
    example: 'your_refresh_token_here',
  })
  @IsNotEmpty()
  refreshToken: string;
}
