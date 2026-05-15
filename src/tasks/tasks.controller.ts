import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
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
import { CurrentUserId } from '../users/decorators/current-user-id.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(
    @Query() filters: FindTaskParamsDto,
    @Query() pagination: PaginationParams,
    @CurrentUserId() userId: string,
  ): Promise<PaginationResponse<Task>> {
    const [items, total] = await this.tasksService.findAll(
      filters,
      pagination,
      userId,
    );
    return {
      data: items,
      meta: {
        total,
        ...pagination,
      },
    };
  }

  @Get(':id')
  async getTaskById(
    @Param() params: FindOneParamsDto,
    @CurrentUserId() userId: string,
  ): Promise<Task> {
    const task = await this.findOneOrThrow(params.id);
    this.checkTaskOwnership(task, userId);
    return task;
  }

  @Post()
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUserId() userId: string,
  ): Promise<Task> {
    return this.tasksService.create({
      ...createTaskDto,
      userId,
    });
  }

  @Patch(':id')
  async updateTask(
    @Param() params: FindOneParamsDto,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUserId() userId: string,
  ): Promise<Task> {
    try {
      const task = await this.findOneOrThrow(params.id);
      this.checkTaskOwnership(task, userId);
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
    @CurrentUserId() userId: string,
  ): Promise<Task> {
    const task = await this.findOneOrThrow(params.id);
    this.checkTaskOwnership(task, userId);
    return await this.tasksService.addLabels(task, labelDtos);
  }

  @Delete(':id/labels')
  async removeLabels(
    @Param() params: FindOneParamsDto,
    @Body() labelNames: string[],
    @CurrentUserId() userId: string,
  ): Promise<Task> {
    const task = await this.findOneOrThrow(params.id);

    this.checkTaskOwnership(task, userId);

    return await this.tasksService.removeLabels(task, labelNames);
  }

  @Delete(':id')
  async deleteTask(
    @Param() params: FindOneParamsDto,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const task = await this.findOneOrThrow(params.id);

    this.checkTaskOwnership(task, userId);

    return await this.tasksService.delete(task);
  }

  private async findOneOrThrow(id: string) {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  checkTaskOwnership(task: Task, userId: string) {
    if (task.userId !== userId) {
      throw new ForbiddenException(
        "You don't have permission to access this task",
      );
    }

    return true;
  }
}
