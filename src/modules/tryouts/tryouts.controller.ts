import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TryoutsService } from './tryouts.service';
import { CreateTryoutDto } from './dto/create-tryout.dto';
import { UpdateTryoutDto } from './dto/update-tryout.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

@ApiTags('Tryouts')
@Controller('tryouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TryoutsController {
  constructor(private readonly tryoutsService: TryoutsService) {}

  @Post()
  @Roles(UserRole.SCOUT)
  @ApiOperation({ summary: 'Request a tryout (Scout only)' })
  @ApiResponse({ status: 201, description: 'Tryout requested successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createTryoutDto: CreateTryoutDto,
    @CurrentUser() user: any,
  ) {
    return this.tryoutsService.create(user.id, createTryoutDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.PLAYER)
  @ApiOperation({ summary: 'Update tryout status (Player only)' })
  @ApiResponse({
    status: 200,
    description: 'Tryout status updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tryout not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateTryoutDto: UpdateTryoutDto,
    @CurrentUser() user: any,
  ) {
    return this.tryoutsService.updateStatus(id, user.id, updateTryoutDto);
  }

  @Get('player')
  @Roles(UserRole.PLAYER)
  @ApiOperation({ summary: 'Get tryouts for current player' })
  @ApiResponse({ status: 200, description: 'Tryouts retrieved successfully' })
  async findByPlayer(@CurrentUser() user: any) {
    return this.tryoutsService.findByPlayer(user.id);
  }

  @Get('scout')
  @Roles(UserRole.SCOUT)
  @ApiOperation({ summary: 'Get tryouts by current scout' })
  @ApiResponse({ status: 200, description: 'Tryouts retrieved successfully' })
  async findByScout(@CurrentUser() user: any) {
    return this.tryoutsService.findByScout(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tryout by ID' })
  @ApiResponse({ status: 200, description: 'Tryout retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tryout not found' })
  async findOne(@Param('id') id: string) {
    return this.tryoutsService.findOne(id);
  }
}
