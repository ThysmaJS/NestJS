import { AppDataSource } from '../data-source';
import { UserEntity } from '../../users/entities/user.entity';
import { TeamEntity } from '../../teams/entities/team.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';
import { UserRole } from '../../users/interfaces/user.interface';
import { ProjectStatus } from '../../projects/interfaces/project.interface';
import { TaskStatus, TaskPriority } from '../../tasks/interfaces/task.interface';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connection initialized');

  await AppDataSource.query(
    'TRUNCATE TABLE comments, tasks, projects, team_members, teams, users CASCADE',
  );
  console.log('Tables truncated');

  const userRepo = AppDataSource.getRepository(UserEntity);
  const teamRepo = AppDataSource.getRepository(TeamEntity);
  const projectRepo = AppDataSource.getRepository(ProjectEntity);
  const taskRepo = AppDataSource.getRepository(TaskEntity);
  const commentRepo = AppDataSource.getRepository(CommentEntity);

  // Users
  const alice = userRepo.create({
    email: 'alice@example.com',
    name: 'Alice',
    passwordHash: await bcrypt.hash('password123', 10),
    role: UserRole.ADMIN,
  });
  const bob = userRepo.create({
    email: 'bob@example.com',
    name: 'Bob',
    passwordHash: await bcrypt.hash('password123', 10),
    role: UserRole.MEMBER,
  });
  const charlie = userRepo.create({
    email: 'charlie@example.com',
    name: 'Charlie',
    passwordHash: await bcrypt.hash('password123', 10),
    role: UserRole.VIEWER,
  });
  await userRepo.save([alice, bob, charlie]);
  console.log('Users created: alice (admin), bob (member), charlie (viewer)');

  // Teams
  const alpha = teamRepo.create({
    name: 'Alpha',
    members: [alice, bob],
  });
  const beta = teamRepo.create({
    name: 'Beta',
    members: [charlie],
  });
  await teamRepo.save([alpha, beta]);
  console.log('Teams created: Alpha (alice + bob), Beta (charlie)');

  // Projects
  const project1 = projectRepo.create({
    name: 'Project Alpha 1',
    description: 'First project of team Alpha',
    status: ProjectStatus.ACTIVE,
    team: alpha,
  });
  const project2 = projectRepo.create({
    name: 'Project Alpha 2',
    description: 'Second project of team Alpha',
    status: ProjectStatus.DRAFT,
    team: alpha,
  });
  await projectRepo.save([project1, project2]);
  console.log('Projects created: Project Alpha 1, Project Alpha 2');

  // Tasks
  const task1 = taskRepo.create({
    title: 'Setup repository',
    description: 'Initialize the git repository and project structure',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    project: project1,
    assignee: alice,
  });
  const task2 = taskRepo.create({
    title: 'Design database schema',
    description: 'Define all entities and relations',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    project: project1,
    assignee: bob,
  });
  const task3 = taskRepo.create({
    title: 'Write unit tests',
    description: 'Cover all service methods',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    project: project1,
  });
  await taskRepo.save([task1, task2, task3]);
  console.log('Tasks created: 3 tasks on Project Alpha 1');

  // Comments
  const comment1 = commentRepo.create({
    content: 'Repository is ready, moving on.',
    author: alice,
    task: task1,
  });
  const comment2 = commentRepo.create({
    content: 'Schema looks good, pending review.',
    author: bob,
    task: task2,
  });
  await commentRepo.save([comment1, comment2]);
  console.log('Comments created: 2 comments');

  await AppDataSource.destroy();
  console.log('Database connection closed');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
