import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsUUID()
  followingId: string;
}

