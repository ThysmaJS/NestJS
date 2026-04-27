import { IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Alpha', description: 'Nom unique de l\'équipe', maxLength: 100 })
  @IsString()
  @MaxLength(100, { message: 'Le nom doit faire au maximum 100 caractères' })
  name: string;

  @ApiPropertyOptional({ example: 'Équipe principale du projet TaskFlow', description: 'Description de l\'équipe', maxLength: 500 })
  @IsString()
  @MaxLength(500, { message: 'La description doit faire au maximum 500 caractères' })
  @IsOptional()
  description?: string;
}
