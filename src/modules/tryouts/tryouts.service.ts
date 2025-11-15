import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tryout } from './entities/tryout.entity';
import { CreateTryoutDto } from './dto/create-tryout.dto';
import { UpdateTryoutDto } from './dto/update-tryout.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { TryoutStatus } from '../../common/enums/tryout-status.enum';

@Injectable()
export class TryoutsService {
  constructor(
    @InjectRepository(Tryout)
    private tryoutsRepository: Repository<Tryout>,
    private usersService: UsersService,
  ) {}

  async create(scoutId: string, createTryoutDto: CreateTryoutDto): Promise<Tryout> {
    const scout = await this.usersService.findOne(scoutId);
    if (scout.role !== UserRole.SCOUT) {
      throw new ForbiddenException('Only scouts can request tryouts');
    }

    const player = await this.usersService.findOne(createTryoutDto.playerId);
    if (player.role !== UserRole.PLAYER) {
      throw new BadRequestException('Tryouts can only be requested for players');
    }

    const tryout = this.tryoutsRepository.create({
      ...createTryoutDto,
      scoutId,
      status: TryoutStatus.PENDING,
    });

    return this.tryoutsRepository.save(tryout);
  }

  async updateStatus(
    id: string,
    playerId: string,
    updateTryoutDto: UpdateTryoutDto,
  ): Promise<Tryout> {
    const tryout = await this.tryoutsRepository.findOne({
      where: { id },
    });

    if (!tryout) {
      throw new NotFoundException('Tryout not found');
    }

    if (tryout.playerId !== playerId) {
      throw new ForbiddenException('You can only update tryouts for yourself');
    }

    Object.assign(tryout, updateTryoutDto);
    return this.tryoutsRepository.save(tryout);
  }

  async findByPlayer(playerId: string): Promise<Tryout[]> {
    return this.tryoutsRepository.find({
      where: { playerId },
      relations: ['scout'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByScout(scoutId: string): Promise<Tryout[]> {
    return this.tryoutsRepository.find({
      where: { scoutId },
      relations: ['player'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tryout> {
    const tryout = await this.tryoutsRepository.findOne({
      where: { id },
      relations: ['scout', 'player'],
    });

    if (!tryout) {
      throw new NotFoundException('Tryout not found');
    }

    return tryout;
  }
}

