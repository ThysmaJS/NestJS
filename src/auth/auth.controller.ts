import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion avec email et mot de passe' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'alice@example.com' },
        password: { type: 'string', example: 'password123', writeOnly: true },
      },
    },
  })
  @ApiOkResponse({ description: 'Token JWT retourné' })
  @ApiUnauthorizedResponse({ description: 'Identifiants invalides' })
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retourne le profil de l\'utilisateur connecté' })
  @ApiOkResponse({ description: 'Profil utilisateur' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  me(@CurrentUser() user: { id: string; email: string; role: string }) {
    return this.usersService.findOne(user.id);
  }
}
