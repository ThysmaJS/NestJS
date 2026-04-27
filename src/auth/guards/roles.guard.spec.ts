import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/dto/create-user.dto';

const createMockContext = (role: string): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 'uuid', email: 'test@test.com', role } }),
    }),
  } as any);

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('autorise si aucun rôle requis (pas de @Roles)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    expect(guard.canActivate(createMockContext(UserRole.VIEWER))).toBe(true);
  });

  it('autorise si @Roles() est appelé avec un tableau vide', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    expect(guard.canActivate(createMockContext(UserRole.VIEWER))).toBe(true);
  });

  it('autorise si le rôle correspond', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    expect(guard.canActivate(createMockContext(UserRole.ADMIN))).toBe(true);
  });

  it('refuse si le rôle est insuffisant', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    expect(guard.canActivate(createMockContext(UserRole.VIEWER))).toBe(false);
  });

  it('autorise si plusieurs rôles acceptés et l\'un correspond', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN, UserRole.MEMBER]);
    expect(guard.canActivate(createMockContext(UserRole.MEMBER))).toBe(true);
  });
});
