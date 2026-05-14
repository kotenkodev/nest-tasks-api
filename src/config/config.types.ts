import { AppConfig } from './app.config';
import * as Joi from 'joi';

export interface ConfigType {
  app: AppConfig;
}

export const appConfigSchema = Joi.object({
  APP_MESSAGE_PREFIX: Joi.string().default('Hello '),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required().default('postgres'),
  DB_PASSWORD: Joi.string().required().default('password'),
  DB_NAME: Joi.string().required().default('tasks'),
});
