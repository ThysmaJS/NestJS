import { IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(1000, { message: 'Le contenu doit faire au maximum 1000 caractères' })
  content: string;

  @IsUUID('4', { message: 'taskId doit être un UUID v4 valide' })
  taskId: string;

  @IsUUID('4', { message: 'authorId doit être un UUID v4 valide' })
  authorId: string;
}
