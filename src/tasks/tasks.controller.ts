import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une tâche' })
  @ApiCreatedResponse({ description: 'Tâche créée' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les tâches' })
  @ApiOkResponse({ description: 'Liste des tâches' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une tâche par UUID' })
  @ApiOkResponse({ description: 'Tâche trouvée' })
  @ApiNotFoundResponse({ description: 'Tâche introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une tâche' })
  @ApiOkResponse({ description: 'Tâche mise à jour' })
  @ApiNotFoundResponse({ description: 'Tâche introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une tâche' })
  @ApiNoContentResponse({ description: 'Tâche supprimée' })
  @ApiNotFoundResponse({ description: 'Tâche introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
