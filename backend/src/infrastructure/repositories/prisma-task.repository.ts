import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TaskRepository } from '../../domain/task/repositories/task.repository';
import { Task } from '../../domain/task/entities/task.entity';
import { TaskStatus } from '../../domain/task/enums/task-status.enum';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(task: Task): Promise<Task> {
    const saved = await this.prisma.task.create({
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        observations: task.observations,
        status: task.status,
        dueDate: task.dueDate,
        assignedUserId: task.assignedUserId,
      },
    });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return null;
    }

    return this.toDomain(task);
  }

  async findAll(): Promise<Task[]> {
    return [];
  }

  private toDomain(task: any): Task {
    return new Task(
      task.id,
      task.title,
      task.description,
      task.observations,
      task.status as TaskStatus,
      task.dueDate,
      task.assignedUserId,
      task.createdAt,
      task.updatedAt,
    );
  }
}
