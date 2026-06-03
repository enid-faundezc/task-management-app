// EFC: Esta clase es el similar a global exception de spring boot (controller advised)
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message =
          (
            exceptionResponse as {
              message?: string | string[];
            }
          ).message?.toString() ?? message;
      }
    }

    // 👇 ESTO FALTA EN TU CÓDIGO
    else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      message,
      path: request.url,
      timestamp: new Date(),
    });
  }
}
