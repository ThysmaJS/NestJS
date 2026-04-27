import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ForeignKey,
  Index,
} from 'typeorm';
import { TaskStatus, TaskPriority } from '../interfaces/task.interface';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';

@Entity('tasks')
@Index(['projectId'])
@Index(['assigneeId'])
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ type: 'uuid' })
  @ForeignKey(() => ProjectEntity)
  projectId: string;

  @ManyToOne(() => ProjectEntity, (project) => project.tasks)
  project: ProjectEntity;

  @Column({ type: 'uuid', nullable: true })
  @ForeignKey(() => UserEntity)
  assigneeId?: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  assignee?: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.task)
  comments: CommentEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
