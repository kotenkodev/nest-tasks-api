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
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { FindOneParamsDto } from './dtos/find-one.params';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { CreateTaskLabelDto } from './dtos/create-task-label.dto';
import { Task } from './task.entity';
import { FindTaskParamsDto } from './dtos/find-task.params';
import { PaginationParams } from '../common/pagination.params';
import { PaginationResponse } from '../common/pagination-response';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(
    @Query() filters: FindTaskParamsDto,
    @Query() pagination: PaginationParams,
  ): Promise<PaginationResponse<Task>> {
    const [items, total] = await this.tasksService.findAll(filters, pagination);
    return {
      data: items,
      meta: {
        total,
        ...pagination,
      },
    };
  }

  @Get(':id')
  getTaskById(@Param() params: FindOneParamsDto): Promise<Task> {
    const task = this.findOneOrThrow(params.id);
    return task;
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  @Patch(':id')
  async updateTask(
    @Param() params: FindOneParamsDto,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    try {
      const task = await this.findOneOrThrow(params.id);
      return await this.tasksService.update(task, updateTaskDto);
    } catch (error) {
      if (error instanceof WrongTaskStatusException) {
        throw new BadRequestException([error.message]);
      }
      throw error;
    }
  }

  @Post(':id/labels')
  async addLabels(
    @Param() params: FindOneParamsDto,
    @Body() labelDtos: CreateTaskLabelDto[],
  ): Promise<Task> {
    const task = await this.findOneOrThrow(params.id);
    return await this.tasksService.addLabels(task, labelDtos);
  }

  @Delete(':id/labels')
  async removeLabels(
    @Param() params: FindOneParamsDto,
    @Body() labelNames: string[],
  ): Promise<Task> {
    const task = await this.findOneOrThrow(params.id);
    return await this.tasksService.removeLabels(task, labelNames);
  }

  @Delete(':id')
  async deleteTask(@Param() params: FindOneParamsDto): Promise<void> {
    const task = await this.findOneOrThrow(params.id);
    return await this.tasksService.delete(task);
  }

  private async findOneOrThrow(id: string) {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }
}
