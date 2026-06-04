// EFC: Este es el módule para la aplicación "task" y
// no impactar de gran manera el AppModule
import { Module } from '@nestjs/common';
import { TaskController } from '../../infrastructure/web/controllers/task.controller';

import { TaskRepository } from '../../domain/task/repositories/task.repository';
import { PrismaTaskRepository } from '../../infrastructure/repositories/prisma-task.repository';

import { TaskFactory } from '../../domain/task/factories/task.factory';

import { CreateTaskHandler } from '../../application/task/handlers/create-task.handler';
import { AssignTaskHandler } from '../../application/task/handlers/assign-task.handler';
import { StartTaskHandler } from '../../application/task/handlers/start-task.handler';
import { StopTaskHandler } from '../../application/task/handlers/stop-task.handler';
import { ResumeTaskHandler } from '../../application/task/handlers/resume-task.handler';
import { CompleteTaskHandler } from '../../application/task/handlers/complete-task.handler';
import { ChangeTaskPriorityHandler } from '../../application/task/handlers/change-task-priority.handler';
import { AddTaskCommentHandler } from '../../application/task/handlers/add-task-comment.handler';

import { GetTasksHandler } from '../../application/task/handlers/get-tasks.handler';
import { GetTaskByIdHandler } from '../../application/task/handlers/get-task-by-id.handler';
import { GetTaskHistoryHandler } from '../../application/task/handlers/get-task-history.handler';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { UpdateTaskHandler } from 'src/application/task/handlers/update-task.handler';

@Module({
  imports: [PrismaModule], // EFC: Simplificamos la llamda al módulo completo.
  controllers: [TaskController],

  providers: [
    TaskFactory,

    CreateTaskHandler,
    UpdateTaskHandler,
    AssignTaskHandler,
    StartTaskHandler,
    StopTaskHandler,
    ResumeTaskHandler,
    CompleteTaskHandler,
    ChangeTaskPriorityHandler,
    AddTaskCommentHandler,

    GetTasksHandler,
    GetTaskByIdHandler,
    GetTaskHistoryHandler,

    {
      provide: TaskRepository,
      useClass: PrismaTaskRepository,
    },
  ],
})
export class TaskModule {}
