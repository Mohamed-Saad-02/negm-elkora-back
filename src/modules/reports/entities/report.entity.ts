import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Video } from '../../videos/entities/video.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporter_id' })
  reporterId: string;

  @ManyToOne(() => User, (user) => user.reports)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ name: 'video_id', nullable: true })
  videoId: string;

  @ManyToOne(() => Video, (video) => video.reports, { nullable: true })
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @Column({ name: 'comment_id', nullable: true })
  commentId: string;

  @ManyToOne(() => Comment, (comment) => comment.reports, { nullable: true })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}

