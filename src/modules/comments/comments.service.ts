import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { VideosService } from '../videos/videos.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private videosService: VideosService,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    // Check if video exists
    await this.videosService.findOne(createCommentDto.videoId, userId);

    // Check if user already commented on this video (only one comment per user)
    const existingComment = await this.commentsRepository.findOne({
      where: {
        videoId: createCommentDto.videoId,
        userId,
        parentCommentId: IsNull(), // Only check top-level comments
      },
    });

    if (existingComment) {
      throw new BadRequestException('You can only comment once per video');
    }

    // If it's a reply, verify parent comment exists
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: createCommentDto.parentCommentId },
        relations: ['video'],
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      // Verify parent comment belongs to the same video
      if (parentComment.videoId !== createCommentDto.videoId) {
        throw new BadRequestException('Parent comment must belong to the same video');
      }
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      userId,
    });

    return this.commentsRepository.save(comment);
  }

  async findByVideo(videoId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { videoId, parentCommentId: IsNull() },
      relations: ['user', 'replies', 'replies.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'video', 'parentComment', 'replies'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);
  }
}

