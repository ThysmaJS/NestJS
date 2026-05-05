import { IsString, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Super travail sur cette tâche !' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;

  @ApiProperty({ example: 'uuid-de-la-tache' })
  @IsUUID('4')
  taskId!: string;
}
