import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('feedback')
@Unique(['scoutId', 'playerId'])
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'scout_id' })
  scoutId: string;

  @ManyToOne(() => User, (user) => user.scoutFeedbacks)
  @JoinColumn({ name: 'scout_id' })
  scout: User;

  @Column({ name: 'player_id' })
  playerId: string;

  @ManyToOne(() => User, (user) => user.playerFeedbacks)
  @JoinColumn({ name: 'player_id' })
  player: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  weaknesses: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

