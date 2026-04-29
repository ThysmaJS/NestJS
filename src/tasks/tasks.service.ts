import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './entities/task.entity';
import { ProjectEntity } from '../projects/entities/project.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
    @InjectRepository(ProjectEntity)
    private readonly projectsRepository: Repository<ProjectEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(dto: CreateTaskDto): Promise<TaskEntity> {
    const project = await this.projectsRepository.findOne({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException(`Project #${dto.projectId} not found`);

    let assignee: UserEntity | undefined;
    if (dto.assigneeId) {
      const found = await this.usersRepository.findOne({ where: { id: dto.assigneeId } });
      if (!found) throw new NotFoundException(`User #${dto.assigneeId} not found`);
      assignee = found;
    }

    const task = this.tasksRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      project,
      assignee,
    });
    return this.tasksRepository.save(task);
  }

  async findAll(): Promise<TaskEntity[]> {
    return this.tasksRepository.find({
      relations: ['project', 'assignee'],
    });
  }

  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project', 'assignee'],
    });
    if (!task) throw new NotFoundException(`Task #${id} not found`);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.findOne(id);
    const previousAssigneeId = task.assignee?.id;

    if (dto.assigneeId !== undefined) {
      if (dto.assigneeId) {
        const assignee = await this.usersRepository.findOne({ where: { id: dto.assigneeId } });
        if (!assignee) throw new NotFoundException(`User #${dto.assigneeId} not found`);
        task.assignee = assignee;
      } else {
        task.assignee = undefined;
      }
    }
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.priority !== undefined) task.priority = dto.priority;

    const updated = await this.tasksRepository.save(task);

    if (dto.assigneeId && dto.assigneeId !== previousAssigneeId) {
      this.notificationsGateway.sendToUser(dto.assigneeId, 'task:assigned', {
        taskId: updated.id,
        taskTitle: updated.title,
        message: `Vous avez été assigné à la tâche "${updated.title}"`,
        timestamp: new Date().toISOString(),
      });
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }
}
