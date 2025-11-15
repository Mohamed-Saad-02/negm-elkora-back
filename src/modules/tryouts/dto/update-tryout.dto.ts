import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TryoutStatus } from '../../../common/enums/tryout-status.enum';

export class UpdateTryoutDto {
  @ApiPropertyOptional({ enum: TryoutStatus })
  @IsOptional()
  @IsEnum(TryoutStatus)
  status?: TryoutStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}

