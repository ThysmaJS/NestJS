import {
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../interfaces/task.interface';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implémenter l\'authentification JWT', description: 'Titre de la tâche', maxLength: 200 })
  @IsString()
  @MaxLength(200, { message: 'Le titre doit faire au maximum 200 caractères' })
  title: string;

  @ApiPropertyOptional({ example: 'Mettre en place Passport.js avec stratégie JWT', description: 'Description détaillée', maxLength: 2000 })
  @IsString()
  @MaxLength(2000, { message: 'La description doit faire au maximum 2000 caractères' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO, description: 'Statut de la tâche' })
  @IsEnum(TaskStatus, {
    message: `Le statut doit être l'un de : ${Object.values(TaskStatus).join(', ')}`,
  })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM, description: 'Priorité de la tâche' })
  @IsEnum(TaskPriority, {
    message: `La priorité doit être l'une de : ${Object.values(TaskPriority).join(', ')}`,
  })
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID du projet auquel appartient la tâche' })
  @IsUUID('4', { message: 'projectId doit être un UUID v4 valide' })
  projectId: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'UUID de l\'utilisateur assigné (optionnel)' })
  @IsUUID('4', { message: 'assigneeId doit être un UUID v4 valide' })
  @IsOptional()
  assigneeId?: string;
}
