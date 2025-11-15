import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    private usersService: UsersService,
  ) {}

  async create(
    scoutId: string,
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    const scout = await this.usersService.findOne(scoutId);
    if (scout.role !== UserRole.SCOUT) {
      throw new ForbiddenException('Only scouts can leave feedback');
    }

    const player = await this.usersService.findOne(createFeedbackDto.playerId);
    if (player.role !== UserRole.PLAYER) {
      throw new BadRequestException('Feedback can only be given to players');
    }

    // Check if feedback already exists
    const existingFeedback = await this.feedbackRepository.findOne({
      where: { scoutId, playerId: createFeedbackDto.playerId },
    });

    if (existingFeedback) {
      // Update existing feedback
      Object.assign(existingFeedback, createFeedbackDto);
      return this.feedbackRepository.save(existingFeedback);
    }

    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      scoutId,
    });

    return this.feedbackRepository.save(feedback);
  }

  async findByPlayer(
    playerId: string,
    currentUserId?: string,
  ): Promise<Feedback[]> {
    const query = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.scout', 'scout')
      .where('feedback.playerId = :playerId', { playerId });

    // Players can see all feedback about them
    // Others can only see public feedback
    const player = await this.usersService.findOne(playerId);
    if (currentUserId !== playerId && player.role === UserRole.PLAYER) {
      query.andWhere('feedback.isPublic = :isPublic', { isPublic: true });
    }

    return query.getMany();
  }

  async findByScout(scoutId: string): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { scoutId },
      relations: ['player'],
    });
  }

  async findOne(id: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['scout', 'player'],
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  async delete(id: string, scoutId: string): Promise<void> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    if (feedback.scoutId !== scoutId) {
      throw new ForbiddenException('You can only delete your own feedback');
    }

    await this.feedbackRepository.remove(feedback);
  }
}
