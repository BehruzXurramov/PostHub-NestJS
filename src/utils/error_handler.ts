import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { logError } from './error_logger';

export function errorHandler(error: unknown, content?: string): never {
  if (error instanceof HttpException) {
    throw error;
  }

  logError(error, content);
  throw new InternalServerErrorException();
}
