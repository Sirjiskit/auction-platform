/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const res = exception.getResponse() as any;

    // NestJS sends errors as { message: [...], error: 'Bad Request', statusCode: 400 }
    const messages = Array.isArray(res.message) ? res.message : [res.message];
    const path = request.path;
    let viewName = 'error';
    let layout = 'layouts/main';
    let pageTitle = 'Home';
    // map route → view
    if (path.includes('register')) {
      viewName = 'auth/register';
      layout = 'layouts/auth';
      pageTitle = 'Register';
    }
    if (path.includes('login')) {
      viewName = 'auth/login';
      layout = 'layouts/auth';
      pageTitle = 'Login';
    }
    if (path.includes('auctions')) {
      viewName = 'auction';
      pageTitle = 'Autions';
    }
    response.render(viewName, {
      title: pageTitle,
      layout: layout,
      errors: messages,
      old: request.body,
      year: new Date().getFullYear(),
    });
  }
}
