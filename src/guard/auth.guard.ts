import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // ✅ Check if session and user exist
    if (request.session && request.session.user) {
      return true;
    }

    throw new UnauthorizedException('You must be logged in');
  }
}
