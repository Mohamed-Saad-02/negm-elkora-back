import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Follows')
@Controller('follows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 201, description: 'Followed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async follow(
    @Body() createFollowDto: CreateFollowDto,
    @CurrentUser() user: any,
  ) {
    return this.followsService.follow(user.id, createFollowDto.followingId);
  }

  @Delete(':followingId')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 200, description: 'Unfollowed successfully' })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  async unfollow(
    @Param('followingId') followingId: string,
    @CurrentUser() user: any,
  ) {
    await this.followsService.unfollow(user.id, followingId);
    return { message: 'Unfollowed successfully' };
  }

  @Get('followers/:userId')
  @ApiOperation({ summary: 'Get followers of a user' })
  @ApiResponse({ status: 200, description: 'Followers retrieved successfully' })
  async getFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get('following/:userId')
  @ApiOperation({ summary: 'Get users that a user is following' })
  @ApiResponse({ status: 200, description: 'Following retrieved successfully' })
  async getFollowing(@Param('userId') userId: string) {
    return this.followsService.getFollowing(userId);
  }
}

