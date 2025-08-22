import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'refreshToken',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty({
    description: 'Session id',
    example: 'sessionId',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  sessionId: string;
}
