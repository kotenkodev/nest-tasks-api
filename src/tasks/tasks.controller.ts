import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { FindOneParamsDto } from './dtos/find-one.params';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getTasks() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  getTaskById(@Param() params: FindOneParamsDto) {
    const task = this.findOneOrThrow(params.id);
    return task;
  }

  @Post()
  createTask(@Body() body: CreateTaskDto) {
    return this.tasksService.create(body);
  }

  @Patch(':id/status')
  updateTaskStatus(
    @Param() params: FindOneParamsDto,
    @Body() body: UpdateTaskStatusDto,
  ) {
    const task = this.findOneOrThrow(params.id);
    task.status = body.status;
    return task;
  }

  @Delete(':id')
  deleteTask(@Param() params: FindOneParamsDto) {
    const task = this.findOneOrThrow(params.id);
    this.tasksService.delete(task.id);
  }

  private findOneOrThrow(id: string) {
    const task = this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }
}
