import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum';
import { Video } from '../../videos/entities/video.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Like } from '../../likes/entities/like.entity';
import { Follow } from '../../follows/entities/follow.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { Tryout } from '../../tryouts/entities/tryout.entity';
import { Report } from '../../reports/entities/report.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  @OneToMany(() => Feedback, (feedback) => feedback.scout)
  scoutFeedbacks: Feedback[];

  @OneToMany(() => Feedback, (feedback) => feedback.player)
  playerFeedbacks: Feedback[];

  @OneToMany(() => Tryout, (tryout) => tryout.scout)
  scoutTryouts: Tryout[];

  @OneToMany(() => Tryout, (tryout) => tryout.player)
  playerTryouts: Tryout[];

  @OneToMany(() => Report, (report) => report.reporter)
  reports: Report[];
}

