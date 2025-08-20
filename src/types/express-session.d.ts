import 'express-session';
import 'express';
import { UserDto } from '../dto/user.dto';
declare module 'express-session' {
  interface SessionData {
    user: UserDto;
  }
}
