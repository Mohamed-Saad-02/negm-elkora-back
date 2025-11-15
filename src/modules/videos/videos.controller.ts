import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Videos')
@Controller('videos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a new video' })
  @ApiResponse({ status: 201, description: 'Video uploaded successfully' })
  async create(
    @Body() createVideoDto: CreateVideoDto,
    @CurrentUser() user: any,
  ) {
    const canShare = await this.videosService.canShare(user.id);
    if (!canShare.canShare) {
      throw new BadRequestException(
        `Cooldown active. Wait ${canShare.cooldownSeconds} seconds`,
      );
    }

    const video = await this.videosService.create(user.id, createVideoDto);
    await this.videosService.updateLastSharedAt(video.id);
    return video;
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get video feed with pagination' })
  @ApiResponse({ status: 200, description: 'Feed retrieved successfully' })
  async getFeed(
    @Query() query: FeedQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.videosService.getFeed(query, user.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get videos by user ID' })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  async findByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.videosService.findByUser(userId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  @ApiResponse({ status: 200, description: 'Video retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.videosService.findOne(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a video' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    await this.videosService.delete(id, user.id);
    return { message: 'Video deleted successfully' };
  }

  @Get('share/cooldown')
  @ApiOperation({ summary: 'Check share cooldown status' })
  @ApiResponse({ status: 200, description: 'Cooldown status retrieved' })
  async getCooldown(@CurrentUser() user: any) {
    return this.videosService.canShare(user.id);
  }
}

