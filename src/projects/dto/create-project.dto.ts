import {
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../interfaces/project.interface';

export class CreateProjectDto {
  @ApiProperty({ example: 'TaskFlow v2', description: 'Nom du projet', maxLength: 200 })
  @IsString()
  @MaxLength(200, { message: 'Le nom doit faire au maximum 200 caractères' })
  name: string;

  @ApiPropertyOptional({ example: 'Refonte complète de l\'API', description: 'Description du projet', maxLength: 1000 })
  @IsString()
  @MaxLength(1000, { message: 'La description doit faire au maximum 1000 caractères' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.DRAFT, description: 'Statut du projet' })
  @IsEnum(ProjectStatus, {
    message: `Le statut doit être l'un de : ${Object.values(ProjectStatus).join(', ')}`,
  })
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID de l\'équipe propriétaire' })
  @IsUUID('4', { message: 'teamId doit être un UUID v4 valide' })
  teamId: string;
}
