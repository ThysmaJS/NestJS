import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entities/comment.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserRole } from '../users/interfaces/user.interface';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(
    dto: CreateCommentDto,
    currentUser: { id: string },
  ): Promise<CommentEntity> {
    const task = await this.tasksRepository.findOne({
      where: { id: dto.taskId },
    });
    if (!task) throw new NotFoundException(`Task #${dto.taskId} not found`);

    const author = await this.usersRepository.findOne({
      where: { id: currentUser.id },
    });
    if (!author) throw new NotFoundException('User not found');

    const comment = this.commentsRepository.create({
      content: dto.content,
      task,
      author,
    });
    return this.commentsRepository.save(comment);
  }

  async findAll(): Promise<CommentEntity[]> {
    return this.commentsRepository.find({
      relations: ['author', 'task'],
    });
  }

  async findOne(id: string): Promise<CommentEntity> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author', 'task'],
    });
    if (!comment) throw new NotFoundException(`Comment #${id} not found`);
    return comment;
  }

  async update(
    id: string,
    dto: UpdateCommentDto,
    currentUser: { id: string; role: string },
  ): Promise<CommentEntity> {
    const comment = await this.findOne(id);

    if (
      comment.author.id !== currentUser.id &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Seul l\'auteur ou un administrateur peut modifier ce commentaire',
      );
    }

    comment.content = dto.content ?? comment.content;
    return this.commentsRepository.save(comment);
  }

  async remove(
    id: string,
    currentUser: { id: string; role: string },
  ): Promise<void> {
    const comment = await this.findOne(id);

    if (
      comment.author.id !== currentUser.id &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Seul l\'auteur ou un administrateur peut supprimer ce commentaire',
      );
    }

    await this.commentsRepository.remove(comment);
  }
}
