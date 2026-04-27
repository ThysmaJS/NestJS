import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ForeignKey,
  Index,
} from 'typeorm';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('comments')
@Index(['taskId'])
@Index(['authorId'])
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => TaskEntity)
  taskId: string;

  @ManyToOne(() => TaskEntity)
  task: TaskEntity;

  @Column({ type: 'uuid' })
  @ForeignKey(() => UserEntity)
  authorId: string;

  @ManyToOne(() => UserEntity)
  author: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
