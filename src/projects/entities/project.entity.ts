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
import { ProjectStatus } from '../interfaces/project.interface';
import { TeamEntity } from '../../teams/entities/team.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';

@Entity('projects')
@Index(['teamId'])
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus;

  @Column({ type: 'uuid' })
  @ForeignKey(() => TeamEntity)
  teamId: string;

  @ManyToOne(() => TeamEntity, (team) => team.projects, {
    onDelete: 'CASCADE',
  })
  team: TeamEntity;

  @OneToMany(() => TaskEntity, (task) => task.project)
  tasks: TaskEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
