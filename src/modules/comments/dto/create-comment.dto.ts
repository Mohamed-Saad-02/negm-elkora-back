import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'video-uuid' })
  @IsUUID()
  videoId: string;

  @ApiProperty({ example: 'Great video!' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: 'parent-comment-uuid' })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}

