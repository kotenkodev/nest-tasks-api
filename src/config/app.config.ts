import { registerAs } from '@nestjs/config';

export interface AppConfig {
  messagePrefix: string;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    messagePrefix: process.env.MESSAGE_PREFIX || 'Hello',
  }),
);
