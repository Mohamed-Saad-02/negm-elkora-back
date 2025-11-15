import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTryoutDto {
  @ApiProperty({ example: 'player-uuid' })
  @IsUUID()
  playerId: string;

  @ApiPropertyOptional({ example: 'I would like to invite you for a tryout' })
  @IsOptional()
  @IsString()
  message?: string;
}

