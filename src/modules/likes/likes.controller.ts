import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Likes')
@Controller('likes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('video/:videoId')
  @ApiOperation({ summary: 'Toggle like on a video' })
  @ApiResponse({ status: 200, description: 'Like toggled successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async toggleLike(
    @Param('videoId') videoId: string,
    @CurrentUser() user: any,
  ) {
    return this.likesService.toggleLike(user.id, videoId);
  }

  @Get('video/:videoId')
  @ApiOperation({ summary: 'Get likes for a video' })
  @ApiResponse({ status: 200, description: 'Likes retrieved successfully' })
  async getLikesByVideo(@Param('videoId') videoId: string) {
    return this.likesService.getLikesByVideo(videoId);
  }
}

