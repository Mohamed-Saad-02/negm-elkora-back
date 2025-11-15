import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { PaginationHelper } from '../../common/helpers/pagination.helper';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
  ) {}

  async create(userId: string, createVideoDto: CreateVideoDto): Promise<Video> {
    const video = this.videosRepository.create({
      ...createVideoDto,
      userId,
    });
    return this.videosRepository.save(video);
  }

  async getFeed(query: FeedQueryDto, userId?: string) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [videos, total] = await this.videosRepository.findAndCount({
      relations: ['user', 'likes', 'comments'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const videosWithStats = videos.map((video) => ({
      ...video,
      likesCount: video.likes?.length || 0,
      commentsCount: video.comments?.length || 0,
      isLiked: userId
        ? video.likes?.some((like) => like.userId === userId) || false
        : false,
    }));

    return PaginationHelper.paginate(videosWithStats, total, page, limit);
  }

  async findByUser(userId: string, currentUserId?: string) {
    const videos = await this.videosRepository.find({
      where: { userId },
      relations: ['user', 'likes', 'comments'],
      order: { createdAt: 'DESC' },
    });

    return videos.map((video) => ({
      ...video,
      likesCount: video.likes?.length || 0,
      commentsCount: video.comments?.length || 0,
      isLiked: currentUserId
        ? video.likes?.some((like) => like.userId === currentUserId) || false
        : false,
    }));
  }

  async findOne(id: string, userId?: string): Promise<Video> {
    const video = await this.videosRepository.findOne({
      where: { id },
      relations: ['user', 'likes', 'comments'],
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return {
      ...video,
      likesCount: video.likes?.length || 0,
      commentsCount: video.comments?.length || 0,
      isLiked: userId
        ? video.likes?.some((like) => like.userId === userId) || false
        : false,
    } as any;
  }

  async delete(id: string, userId: string): Promise<void> {
    const video = await this.videosRepository.findOne({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.userId !== userId) {
      throw new ForbiddenException('You can only delete your own videos');
    }

    await this.videosRepository.remove(video);
  }

  async canShare(userId: string): Promise<{ canShare: boolean; cooldownSeconds?: number }> {
    const lastVideo = await this.videosRepository.findOne({
      where: { userId },
      order: { lastSharedAt: 'DESC' },
    });

    if (!lastVideo || !lastVideo.lastSharedAt) {
      return { canShare: true };
    }

    const cooldownMinutes = 60; // 1 hour cooldown
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const timeSinceLastShare = Date.now() - lastVideo.lastSharedAt.getTime();

    if (timeSinceLastShare < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastShare) / 1000);
      return { canShare: false, cooldownSeconds: remainingSeconds };
    }

    return { canShare: true };
  }

  async updateLastSharedAt(videoId: string): Promise<void> {
    await this.videosRepository.update(videoId, {
      lastSharedAt: new Date(),
    });
  }
}

