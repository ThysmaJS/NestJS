import {
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ProjectStatus } from '../interfaces/project.interface';

export class CreateProjectDto {
  @IsString()
  @MaxLength(200, { message: 'Le nom doit faire au maximum 200 caractères' })
  name: string;

  @IsString()
  @MaxLength(1000, { message: 'La description doit faire au maximum 1000 caractères' })
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus, {
    message: `Le statut doit être l'un de : ${Object.values(ProjectStatus).join(', ')}`,
  })
  @IsOptional()
  status?: ProjectStatus;

  @IsUUID('4', { message: 'teamId doit être un UUID v4 valide' })
  teamId: string;
}
