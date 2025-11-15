import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { VideosService } from '../videos/videos.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    private videosService: VideosService,
  ) {}

  async toggleLike(userId: string, videoId: string): Promise<{ liked: boolean }> {
    // Verify video exists
    await this.videosService.findOne(videoId, userId);

    const existingLike = await this.likesRepository.findOne({
      where: { userId, videoId },
    });

    if (existingLike) {
      await this.likesRepository.remove(existingLike);
      return { liked: false };
    } else {
      const like = this.likesRepository.create({ userId, videoId });
      await this.likesRepository.save(like);
      return { liked: true };
    }
  }

  async getLikesByVideo(videoId: string): Promise<Like[]> {
    return this.likesRepository.find({
      where: { videoId },
      relations: ['user'],
    });
  }
}

