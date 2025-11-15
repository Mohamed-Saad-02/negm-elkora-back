import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { VideosService } from '../videos/videos.service';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    private videosService: VideosService,
    private commentsService: CommentsService,
  ) {}

  async create(reporterId: string, createReportDto: CreateReportDto): Promise<Report> {
    // Validate that either videoId or commentId is provided, but not both
    if (!createReportDto.videoId && !createReportDto.commentId) {
      throw new BadRequestException('Either videoId or commentId must be provided');
    }

    if (createReportDto.videoId && createReportDto.commentId) {
      throw new BadRequestException('Cannot report both video and comment at once');
    }

    // Verify the video or comment exists
    if (createReportDto.videoId) {
      await this.videosService.findOne(createReportDto.videoId);
    }

    if (createReportDto.commentId) {
      await this.commentsService.findOne(createReportDto.commentId);
    }

    const report = this.reportsRepository.create({
      ...createReportDto,
      reporterId,
    });

    return this.reportsRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return this.reportsRepository.find({
      relations: ['reporter', 'video', 'comment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: ['reporter', 'video', 'comment'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }
}

