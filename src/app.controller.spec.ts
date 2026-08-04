import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerService } from './logger/logger.service';
import { TypedConfigService } from './config/typed-config.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn((msg: string) => msg),
          },
        },
        {
          provide: TypedConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({ messagePrefix: 'Hello' }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return greeting message', () => {
      expect(appController.getHello()).toContain('Hello');
    });
  });
});
