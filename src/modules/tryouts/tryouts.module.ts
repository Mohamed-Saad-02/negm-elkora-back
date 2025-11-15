import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TryoutsService } from './tryouts.service';
import { TryoutsController } from './tryouts.controller';
import { Tryout } from './entities/tryout.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tryout]), UsersModule],
  controllers: [TryoutsController],
  providers: [TryoutsService],
  exports: [TryoutsService],
})
export class TryoutsModule {}

