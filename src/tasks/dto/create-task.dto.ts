import {
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../interfaces/task.interface';

export class CreateTaskDto {
  @IsString()
  @MaxLength(200, { message: 'Le titre doit faire au maximum 200 caractères' })
  title: string;

  @IsString()
  @MaxLength(2000, { message: 'La description doit faire au maximum 2000 caractères' })
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus, {
    message: `Le statut doit être l'un de : ${Object.values(TaskStatus).join(', ')}`,
  })
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority, {
    message: `La priorité doit être l'une de : ${Object.values(TaskPriority).join(', ')}`,
  })
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID('4', { message: 'projectId doit être un UUID v4 valide' })
  projectId: string;

  @IsUUID('4', { message: 'assigneeId doit être un UUID v4 valide' })
  @IsOptional()
  assigneeId?: string;
}
