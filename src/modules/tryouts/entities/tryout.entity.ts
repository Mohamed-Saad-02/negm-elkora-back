import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { TryoutStatus } from '@/common/enums/tryout-status.enum';

@Entity('tryouts')
export class Tryout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'scout_id' })
  scoutId: string;

  @ManyToOne(() => User, (user) => user.scoutTryouts)
  @JoinColumn({ name: 'scout_id' })
  scout: User;

  @Column({ name: 'player_id' })
  playerId: string;

  @ManyToOne(() => User, (user) => user.playerTryouts)
  @JoinColumn({ name: 'player_id' })
  player: User;

  @Column({
    type: 'enum',
    enum: TryoutStatus,
    default: TryoutStatus.PENDING,
  })
  status: TryoutStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
