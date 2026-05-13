import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageFormatterService } from './message-formatter/message-formatter.service';
import { LoggerService } from './logger/logger.service';
import { TasksService } from './tasks/tasks.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, MessageFormatterService, LoggerService, TasksService],
})
export class AppModule {}
