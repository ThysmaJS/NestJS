import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((u) => u.id.toString() === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  create(dto: CreateUserDto): User {
    // Vérifier qu'aucun utilisateur n'a déjà cet email
    if (this.findByEmail(dto.email)) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    // Créer le nouvel utilisateur
    const newUser: User = {
      id: parseInt(randomUUID().replace(/-/g, '').substring(0, 10)),
      email: dto.email,
      name: dto.name,
      password: dto.password,
      role: dto.role ?? UserRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  update(id: string, dto: UpdateUserDto): User {
    // Récupérer l'utilisateur (findOne lève déjà 404)
    const user = this.findOne(id);

    // Si l'email change, vérifier qu'il n'est pas déjà pris
    if (dto.email && dto.email !== user.email) {
      if (this.findByEmail(dto.email)) {
        throw new ConflictException(
          `User with email ${dto.email} already exists`,
        );
      }
      user.email = dto.email;
    }

    // Mettre à jour les autres champs
    if (dto.name !== undefined) {
      user.name = dto.name;
    }
    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    user.updatedAt = new Date();
    return user;
  }

  remove(id: string): void {
    const index = this.users.findIndex((u) => u.id.toString() === id);
    if (index === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    this.users.splice(index, 1);
  }
}
