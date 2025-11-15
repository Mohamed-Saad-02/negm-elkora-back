import { IsString, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({ example: 'https://example.com/video.mp4' })
  @IsUrl()
  @IsString()
  videoUrl: string;

  @ApiProperty({ required: false, example: 'https://example.com/thumbnail.jpg' })
  @IsOptional()
  @IsUrl()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ required: false, example: 'My awesome video' })
  @IsOptional()
  @IsString()
  caption?: string;
}

