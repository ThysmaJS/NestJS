import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserRole } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    this.logger.log(`Création d'un utilisateur : ${dto.email}`);
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    // Hacher le mot de passe
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Créer et sauvegarder l'utilisateur
    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role,
    });

    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto, currentUser: { id: string; role: string }): Promise<UserEntity> {
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException();
    }
    // Récupérer l'utilisateur
    const user = await this.findOne(id);

    // Vérifier l'unicité de l'email si changé
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException(
          `User with email ${dto.email} already exists`,
        );
      }
    }

    // Mettre à jour l'utilisateur
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    this.logger.warn(`Suppression de l'utilisateur : ${id}`);
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
