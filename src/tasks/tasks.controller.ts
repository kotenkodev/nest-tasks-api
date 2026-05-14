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
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { CreateTaskLabelDto } from './dtos/create-task-label.dto';

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
  async updateTask(
    @Param() params: FindOneParamsDto,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
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
  ) {
    const task = await this.findOneOrThrow(params.id);
    return await this.tasksService.addLabels(task, labelDtos);
  }

  @Delete(':id')
  async deleteTask(@Param() params: FindOneParamsDto) {
    const task = await this.findOneOrThrow(params.id);
    return await this.tasksService.delete(task.id);
  }

  private async findOneOrThrow(id: string) {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }
}
