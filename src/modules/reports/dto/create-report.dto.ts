import { IsString, IsUUID, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiPropertyOptional({ example: 'video-uuid' })
  @IsOptional()
  @IsUUID()
  @ValidateIf((o) => !o.commentId)
  videoId?: string;

  @ApiPropertyOptional({ example: 'comment-uuid' })
  @IsOptional()
  @IsUUID()
  @ValidateIf((o) => !o.videoId)
  commentId?: string;

  @ApiProperty({ example: 'Inappropriate content' })
  @IsString()
  reason: string;
}

