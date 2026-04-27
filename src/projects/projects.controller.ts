import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user.interface';

@ApiTags('projects')
@ApiBearerAuth('JWT-auth')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Créer un projet (ADMIN ou MEMBER)' })
  @ApiCreatedResponse({ description: 'Projet créé' })
  @ApiForbiddenResponse({ description: 'Réservé aux ADMIN et MEMBER' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les projets' })
  @ApiOkResponse({ description: 'Liste des projets' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un projet par UUID' })
  @ApiOkResponse({ description: 'Projet trouvé' })
  @ApiNotFoundResponse({ description: 'Projet introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Modifier un projet (ADMIN ou MEMBER)' })
  @ApiOkResponse({ description: 'Projet mis à jour' })
  @ApiNotFoundResponse({ description: 'Projet introuvable' })
  @ApiForbiddenResponse({ description: 'Réservé aux ADMIN et MEMBER' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un projet (ADMIN uniquement)' })
  @ApiNoContentResponse({ description: 'Projet supprimé' })
  @ApiNotFoundResponse({ description: 'Projet introuvable' })
  @ApiForbiddenResponse({ description: 'Réservé aux administrateurs' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
