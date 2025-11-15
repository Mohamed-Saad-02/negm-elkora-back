import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles(UserRole.SCOUT)
  @ApiOperation({ summary: 'Create feedback for a player (Scout only)' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() user: any,
  ) {
    return this.feedbackService.create(user.id, createFeedbackDto);
  }

  @Get('player/:playerId')
  @ApiOperation({ summary: 'Get feedback for a player' })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  async findByPlayer(
    @Param('playerId') playerId: string,
    @CurrentUser() user: any,
  ) {
    return this.feedbackService.findByPlayer(playerId, user.id);
  }

  @Get('scout')
  @Roles(UserRole.SCOUT)
  @ApiOperation({ summary: 'Get feedback by current scout' })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  async findByScout(@CurrentUser() user: any) {
    return this.feedbackService.findByScout(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.SCOUT)
  @ApiOperation({ summary: 'Delete feedback (Scout only)' })
  @ApiResponse({ status: 200, description: 'Feedback deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    await this.feedbackService.delete(id, user.id);
    return { message: 'Feedback deleted successfully' };
  }
}

