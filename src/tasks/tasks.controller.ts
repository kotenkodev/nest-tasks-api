import {
  BadRequestException,
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
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';

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
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Patch(':id')
  updateTask(
    @Param() params: FindOneParamsDto,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    try {
      const task = this.findOneOrThrow(params.id);
      return this.tasksService.update(task, updateTaskDto);
    } catch (error) {
      if (error instanceof WrongTaskStatusException) {
        throw new BadRequestException('Invalid status transition');
      }
      throw error;
    }
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
