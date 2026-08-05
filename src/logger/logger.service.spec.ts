import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import { MessageFormatterService } from '../message-formatter/message-formatter.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: MessageFormatterService,
          useValue: {
            format: jest.fn((msg: string) => msg),
          },
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
