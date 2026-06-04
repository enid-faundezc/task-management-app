// EFC: Porqué el controller va acá; los Controllers NO van en Domain ni en Application.
// Van en la capa de entrada (Presentation/Infrastructure), porque es un adaptador de entrada.
// En Hexagonal se llama: Primary Adapter o Driving Adapter.
// No va en domain/ ni en application/, porque:
// El dominio no sabe qué es HTTP.
// La aplicación no debería depender de NestJS.
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddTaskCommentCommand } from 'src/application/task/commands/add-task-comment.command';
import { AssignTaskCommand } from 'src/application/task/commands/assign-task.command';
import { ChangeTaskPriorityCommand } from 'src/application/task/commands/change-task-priority.command';
import { CompleteTaskCommand } from 'src/application/task/commands/complete-task.command';
import { CreateTaskCommand } from 'src/application/task/commands/create-task.command';
import { ResumeTaskCommand } from 'src/application/task/commands/resume-task.command';
import { StartTaskCommand } from 'src/application/task/commands/start-task.command';
import { StopTaskCommand } from 'src/application/task/commands/stop-task.command';
import { AddTaskCommentDto } from 'src/application/task/dto/add-task-commentdto';
import { AssignTaskDto } from 'src/application/task/dto/assign-task.dto';
import { ChangeTaskPriorityDto } from 'src/application/task/dto/change-task-priority.dto';
import { CreateTaskResponseDto } from 'src/application/task/dto/create-task-response.dto';
import { CreateTaskDto } from 'src/application/task/dto/create-task.dto';
import { TaskFiltersDto } from 'src/application/task/dto/task-filters.dto';
import { TaskHistoryResponseDto } from 'src/application/task/dto/task-history-response.dto';
import { TaskResponseDto } from 'src/application/task/dto/task-response.dto';
import { AddTaskCommentHandler } from 'src/application/task/handlers/add-task-comment.handler';
import { AssignTaskHandler } from 'src/application/task/handlers/assign-task.handler';
import { ChangeTaskPriorityHandler } from 'src/application/task/handlers/change-task-priority.handler';
import { CompleteTaskHandler } from 'src/application/task/handlers/complete-task.handler';
import { CreateTaskHandler } from 'src/application/task/handlers/create-task.handler';
import { GetTaskByIdHandler } from 'src/application/task/handlers/get-task-by-id.handler';
import { GetTasksHandler } from 'src/application/task/handlers/get-tasks.handler';
import { GetTaskHistoryHandler } from 'src/application/task/handlers/get-task-history.handler';
import { ResumeTaskHandler } from 'src/application/task/handlers/resume-task.handler';
import { StartTaskHandler } from 'src/application/task/handlers/start-task.handler';
import { StopTaskHandler } from 'src/application/task/handlers/stop-task.handler';
import { TaskHistoryResponseMapper } from 'src/application/task/mappers/task-history-response.mapper';
import { GetTaskByIdQuery } from 'src/application/task/queries/get-task-by-id.query';
import { GetTaskHistoryQuery } from 'src/application/task/queries/get-task-history.query';
import { GetTasksQuery } from 'src/application/task/queries/get-tasks.query';
import { TaskHistory } from 'src/domain/task/entities/task-history.entity';
import { ApiResponse } from 'src/shared/api/api-response';
import { PaginatedResult } from 'src/shared/pagination/paginated-result';
import { Roles } from 'src/shared/auth/roles.decorator';
import { Role } from '../../../shared/auth/role.enum';
import { Request } from '@nestjs/common';
import type { AuthRequest } from 'src/shared/auth/auth-request.interface';
import { UpdateTaskDto } from 'src/application/task/dto/update-task.dto';
import { UpdateTaskHandler } from 'src/application/task/handlers/update-task.handler';
import { UpdateTaskCommand } from '../../../application/task/commands/update-task.command';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly createTaskHandler: CreateTaskHandler,
    private readonly updateTaskHandler: UpdateTaskHandler,
    private readonly getTasksHandler: GetTasksHandler,
    private readonly getTaskByIdHandler: GetTaskByIdHandler,
    private readonly assignTaskHandler: AssignTaskHandler,
    private readonly startTaskHandler: StartTaskHandler,
    private readonly stopTaskHandler: StopTaskHandler,
    private readonly resumeTaskHandler: ResumeTaskHandler,
    private readonly completeTaskHandler: CompleteTaskHandler,
    private readonly changePriorityHandler: ChangeTaskPriorityHandler,
    private readonly addCommentHandler: AddTaskCommentHandler,
    private readonly getTaskHistoryHandler: GetTaskHistoryHandler,
  ) {}

  // EFC: Método para crear tarea
  @Post()
  @Roles(Role.USER) //EFC: Decorador para validar los roles en el JWT
  @ApiOperation({ summary: 'Create a task' })
  // eslint-disable-next-line prettier/prettier
  async create( @Body() dto: CreateTaskDto,): Promise<ApiResponse<CreateTaskResponseDto>> {
    
    const response = await this.createTaskHandler.execute(
      new CreateTaskCommand(dto),
    );

    return ApiResponse.success(response, 'Task created successfully');
  }

  // EFC: Método para modificar la tarea:
  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update task' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Request() req: AuthRequest,
  ): Promise<ApiResponse<TaskResponseDto>> {

    const result = await this.updateTaskHandler.execute(
      new UpdateTaskCommand(id, dto, req.user),
    );

    return ApiResponse.success(result, 'Task updated successfully');
  }

  // EFC: Obtener tareas: Si es admin todas, si es user: Solo las propias.
  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get tasks' })
  // eslint-disable-next-line prettier/prettier
  async findAll( @Query() filters: TaskFiltersDto, @Request() req: AuthRequest): Promise<ApiResponse<PaginatedResult<TaskResponseDto>>> {

    const result = await this.getTasksHandler.execute(
      new GetTasksQuery(filters, req.user),
    );

    return ApiResponse.success(result, 'Tasks retrieved successfully');
  }

  // EFC: Obtener tarea por ID
  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get task by id' })
  // eslint-disable-next-line prettier/prettier
  async findById(@Param('id') id: string, @Request() req: AuthRequest): Promise<ApiResponse<TaskResponseDto>> {

    const task = await this.getTaskByIdHandler.execute(
      new GetTaskByIdQuery(id, req.user),
    );

    return ApiResponse.success(task, 'Task retrieved successfully');
  }

  // EFC: Obtener historial
  @Get(':id/history')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get task history ' })
  // eslint-disable-next-line prettier/prettier
  async history(@Param('id') id: string): Promise<ApiResponse<TaskHistoryResponseDto[]>> {

    const history = await this.getTaskHistoryHandler.execute(
      new GetTaskHistoryQuery(id),
    );

    return ApiResponse.success(
      history.map((item: TaskHistory) => TaskHistoryResponseMapper.toDto(item)),
      'History retrieved successfully',
    );
  }

  //EFC: Asignar tarea
  @Roles(Role.ADMIN)
  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign task' })
  // eslint-disable-next-line prettier/prettier
  async assign(@Param('id') id: string, @Body() dto: AssignTaskDto ): Promise<ApiResponse<null>> {

    await this.assignTaskHandler.execute(new AssignTaskCommand(id, dto.userId));

    return ApiResponse.success(null, 'Task assigned successfully');
  }

  //EFC: Iniciar tarea
  @Post(':id/start')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Start task' })
  // eslint-disable-next-line prettier/prettier
  async start(@Param('id') id: string, @Request() req: AuthRequest): Promise<ApiResponse<null>> {

    await this.startTaskHandler.execute(new StartTaskCommand(id, req.user));

    return ApiResponse.success(null, 'Task started successfully');
  }

  //EFC: Detener tarea
  @Post(':id/stop')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Stop task' })
  // eslint-disable-next-line prettier/prettier
  async stop(@Param('id') id: string, @Request() req: AuthRequest): Promise<ApiResponse<null>> {

    await this.stopTaskHandler.execute(new StopTaskCommand(id, req.user));

    return ApiResponse.success(null, 'Task stopped successfully');
  }

  //EFC: Reanudar tarea
  @Post(':id/resume')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Resume task' })
  // eslint-disable-next-line prettier/prettier
  async resume(@Param('id') id: string, @Request() req: AuthRequest): Promise<ApiResponse<null>> {

    await this.resumeTaskHandler.execute(new ResumeTaskCommand(id, req.user));

    return ApiResponse.success(null, 'Task resumed successfully');
  }

  //EFC: Completar tarea
  @Post(':id/complete')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Complete task' })
  // eslint-disable-next-line prettier/prettier
  async complete(@Param('id') id: string, @Request() req: AuthRequest): Promise<ApiResponse<null>> {

    await this.completeTaskHandler.execute(
      new CompleteTaskCommand(id, req.user),
    );

    return ApiResponse.success(null, 'Task completed successfully');
  }

  // EFC: Cambiar prioridad
  @Patch(':id/priority')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Change task priority' })
  // eslint-disable-next-line prettier/prettier
  async changePriority(@Param('id') id: string, @Body() dto: ChangeTaskPriorityDto): Promise<ApiResponse<null>> {

    await this.changePriorityHandler.execute(
      new ChangeTaskPriorityCommand(id, dto.priority),
    );

    return ApiResponse.success(null, 'Priority updated successfully');
  }

  //EFC: Agregar comentario
  @Post(':id/comments')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Add comment' })
  // eslint-disable-next-line prettier/prettier
  async addComment(@Param('id') id: string, @Body() dto: AddTaskCommentDto, @Request() req: AuthRequest): Promise<ApiResponse<null>> {

    await this.addCommentHandler.execute(
      new AddTaskCommentCommand(id, dto.comment, req.user),
    );

    return ApiResponse.success(null, 'Comment added successfully');
  }
}
