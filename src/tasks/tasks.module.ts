import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity } from './entities/task.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity]), NotificationsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
