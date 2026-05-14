import { Injectable } from '@nestjs/common';
import { TaskStatus } from './task.model';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskLabelDto } from './dtos/create-task-label.dto';
import { TaskLabel } from './task-label.entity';
import { FindTaskParamsDto } from './dtos/find-task.params';
import { PaginationParams } from 'src/common/pagination.params';
import { PaginationResponse } from 'src/common/pagination-response';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskLabel)
    private readonly labelRepository: Repository<TaskLabel>,
  ) {}

  async findAll(
    filters: FindTaskParamsDto,
    pagination: PaginationParams,
  ): Promise<[Task[], number]> {
    const where: FindOptionsWhere<Task> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search?.trim()) {
      where.title = Like(`%${filters.search.trim()}%`);
      where.description = Like(`%${filters.search.trim()}%`);
    }

    return await this.taskRepository.findAndCount({
      where,
      relations: ['labels'],
      take: pagination.limit,
      skip: pagination.offset,
    });
  }

  async findOne(id: string): Promise<Task | null> {
    return await this.taskRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    if (createTaskDto.labels) {
      createTaskDto.labels = this.getUniqueLabels(createTaskDto.labels);
    }
    return await this.taskRepository.save(createTaskDto);
  }

  private isValidStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    const statusOrder = [
      TaskStatus.OPEN,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);

    return currentIndex <= newIndex;
  }

  async update(task: Task, updateTaskDto: UpdateTaskDto): Promise<Task> {
    if (
      updateTaskDto.status &&
      !this.isValidStatusTransition(task.status, updateTaskDto.status)
    ) {
      throw new WrongTaskStatusException();
    }

    if (updateTaskDto.labels) {
      updateTaskDto.labels = this.getUniqueLabels(updateTaskDto.labels);
    }

    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async addLabels(task: Task, labelDtos: CreateTaskLabelDto[]): Promise<Task> {
    const names = new Set(task.labels.map((label) => label.name));

    const labels = this.getUniqueLabels(labelDtos)
      .filter((dto) => !names.has(dto.name))
      .map((dto) => this.labelRepository.create(dto));

    if (labels.length === 0) {
      return task;
    }

    task.labels = [...task.labels, ...labels];
    return await this.taskRepository.save(task);
  }

  async removeLabels(task: Task, labelNames: string[]): Promise<void> {
    task.labels = task.labels.filter((label) =>
      labelNames.includes(label.name),
    );

    await this.taskRepository.save(task);
  }

  async delete(task: Task): Promise<void> {
    await this.taskRepository.remove(task);
  }

  getUniqueLabels(labelDtos: CreateTaskLabelDto[]): CreateTaskLabelDto[] {
    const uniqueNames = [...new Set(labelDtos.map((label) => label.name))];
    return uniqueNames.map((name) => ({ name }));
  }
}
