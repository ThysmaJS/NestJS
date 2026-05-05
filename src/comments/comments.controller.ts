import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('comments')
@ApiBearerAuth('JWT-auth')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un commentaire sur une tâche' })
  @ApiCreatedResponse({ description: 'Commentaire créé' })
  @ApiNotFoundResponse({ description: 'Tâche introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    return this.commentsService.create(createCommentDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les commentaires' })
  @ApiOkResponse({ description: 'Liste des commentaires' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un commentaire par UUID' })
  @ApiOkResponse({ description: 'Commentaire trouvé' })
  @ApiNotFoundResponse({ description: 'Commentaire introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un commentaire (auteur ou ADMIN)' })
  @ApiOkResponse({ description: 'Commentaire mis à jour' })
  @ApiNotFoundResponse({ description: 'Commentaire introuvable' })
  @ApiForbiddenResponse({ description: 'Modification réservée à l\'auteur ou à un admin' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() currentUser: { id: string; role: string },
  ) {
    return this.commentsService.update(id, updateCommentDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un commentaire (auteur ou ADMIN)' })
  @ApiNoContentResponse({ description: 'Commentaire supprimé' })
  @ApiNotFoundResponse({ description: 'Commentaire introuvable' })
  @ApiForbiddenResponse({ description: 'Suppression réservée à l\'auteur ou à un admin' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: { id: string; role: string },
  ) {
    return this.commentsService.remove(id, currentUser);
  }
}
