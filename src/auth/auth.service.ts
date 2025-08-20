/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { CreateUserDto, LoginDto, UserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService extends PrismaService {
  async register(body: CreateUserDto) {
    try {
      const checkEmail = await this.user.findUnique({
        where: { email: body.email },
      });
      if (checkEmail) {
        return { error: 1, result: 'Email aready exists' };
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);
      await this.user.create({
        data: {
          ...body,
          password: hashedPassword,
        },
      });
      return { error: 0, result: body };
    } catch (error: any) {
      return { error: 2, result: error.message ?? 'An unknown error occurred' };
    }
  }
  async gitUserById(id: string): Promise<UserDto | null> {
    try {
      const user = await this.user.findUniqueOrThrow({ where: { id: id } });
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async login(dto: LoginDto) {
    try {
      // 1. Find user by email
      const user = await this.user.findUnique({ where: { email: dto.email } });
      if (!user) {
        return { error: 1, result: 'Invalid email or password' };
      }
      const { password, ...others } = user;
      // 2. Compare password
      const isMatch = await bcrypt.compare(dto.password, password);
      if (!isMatch) {
        return { error: 1, result: 'Invalid email or password' };
      }

      return { error: 0, result: others };
    } catch (error: any) {
      return { error: 2, result: error.message ?? 'An unknown error occurred' };
    }
  }
}
