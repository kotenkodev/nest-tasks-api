import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfig } from './app.config';
import * as Joi from 'joi';
import { AuthConfig } from './auth.config';

export interface ConfigType {
  app: AppConfig;
  database: TypeOrmModuleOptions;
  auth: AuthConfig;
}

export const appConfigSchema = Joi.object({
  APP_MESSAGE_PREFIX: Joi.string().default('Hello '),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().empty('').default('postgres'),
  DB_PASSWORD: Joi.string().empty('').default('postgres'),
  DB_NAME: Joi.string().empty('').default('tasks'),
  DB_SYNC: Joi.boolean().required().default(false),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required().default('1h'),
});
