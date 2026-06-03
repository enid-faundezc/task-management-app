import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TaskRepository } from '../../domain/task/repositories/task.repository';
import { Task } from '../../domain/task/entities/task.entity';
import { TaskFilters } from 'src/domain/task/repositories/task-filters';
import { PaginatedResult } from 'src/shared/pagination/paginated-result';
import { TaskNotFoundException } from 'src/domain/task/exceptions/task-not-found.exception';
import { PrismaTaskMapper } from './mappers/prisma-task.mapper';
import { Prisma } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

// EFC: La función de este servicio es Persistir Aggregate,
// ojo TaskRepository es una clase abstracta, no una interface.
@Injectable()
export class PrismaTaskRepository extends TaskRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // EFC: Nota: Repository NO crea ni modifica el dominio
  // Repository SOLO persiste, por eso su return es void, el dominio
  // se crea y modifica en el servicio de dominio, y luego se le pasa al
  // repositorio para que lo persista.
  // EFC: En este método se persiste la tarea y sus eventos pendientes de persistencia.
  async save(task: Task): Promise<void> {
    // 1. Persistir la tarea directamente
    await this.prisma.client.task.create({ 
      data: PrismaTaskMapper.toPersistence(task) 
    });

    // 2. Persistir el historial de eventos secuencialmente si existen
    const events = task.getPendingHistory();
    if (events.length > 0) {
      for (const event of events) {
        await this.prisma.client.taskHistory.create({
          data: PrismaTaskMapper.historyToPersistence(event),
        });
      }
    }

    task.clearPendingHistory();
  }
  // EFC: Actualizar tarea en BD
  async update(task: Task): Promise<void> {
    await this.prisma.client.$transaction(async (tx) => {
      // 1. Update TASK
      await tx.task.update({
        where: { id: task.id },
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          observations: task.observations,
          dueDate: task.dueDate,
          assignedUserId: task.assignedUserId,
          updatedAt: task.updatedAt,
        },
      });

      // EFC: 2. Persistir SOLO eventos nuevos
      const events = task.getPendingHistory();

      if (events.length > 0) {
        await tx.taskHistory.createMany({
          data: events.map((event) =>
            PrismaTaskMapper.historyToPersistence(event),
          ),
        });
      }
    });

    task.clearPendingHistory();
  }

  // EFC: Obtener tarea por ID, incluyendo su historial de eventos
  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.client.task.findUnique({
      where: { id },
      include: {
        histories: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return PrismaTaskMapper.toDomain(task);
  }

  // EFC: Obtener todas las tareas, incluyendo su historial de eventos
  async findAll(filters: TaskFilters): Promise<PaginatedResult<Task>> {
    const page = filters.page ?? 1;
    const size = filters.size ?? 10;

    const where: Prisma.TaskWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedUserId) {
      where.assignedUserId = filters.assignedUserId;
    }

    if (filters.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    // 1. Definimos las promesas de forma segura
    const [tasks, total] = await Promise.all([
      this.prisma.client.task.findMany({
        where,
        include: {
          histories: true,
        },
        skip: (page - 1) * size,
        take: size,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.client.task.count({ where }),
    ]);

    // 2. Forzamos el tipado correcto de la base de datos para que ESLint no llore
    // Usamos el tipo generado de Prisma que incluye las relaciones (histories)
    type TaskWithHistories = Prisma.TaskGetPayload<{
      include: { histories: true };
    }>;
    const typedTasks = tasks as TaskWithHistories[];

    return {
      // 3. Mapeamos usando la variable con tipo seguro
      data: typedTasks.map((task) => PrismaTaskMapper.toDomain(task)),
      total,
      page,
      size,
    };
  }

  // EFC: Método adicional para obtener una tarea o lanzar excepción 
  // si no existe, útil para casos donde se requiere la existencia de la tarea.
  async findOrFail(id: string): Promise<Task> {
    const task = await this.findById(id);

    if (!task) {
      throw new TaskNotFoundException(id);
    }

    return task;
  }
}
