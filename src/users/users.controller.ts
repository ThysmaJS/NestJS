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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from './interfaces/user.interface';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un utilisateur (ADMIN uniquement)' })
  @ApiCreatedResponse({ description: 'Utilisateur créé' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  @ApiForbiddenResponse({ description: 'Réservé aux administrateurs' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les utilisateurs' })
  @ApiOkResponse({ description: 'Liste des utilisateurs' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par UUID' })
  @ApiOkResponse({ description: 'Utilisateur trouvé' })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un utilisateur (ADMIN ou propriétaire)' })
  @ApiOkResponse({ description: 'Utilisateur mis à jour' })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable' })
  @ApiForbiddenResponse({ description: 'Modification d\'un autre profil interdite' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: { id: string; email: string; role: string },
  ) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un utilisateur (ADMIN uniquement)' })
  @ApiNoContentResponse({ description: 'Utilisateur supprimé' })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable' })
  @ApiForbiddenResponse({ description: 'Réservé aux administrateurs' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
