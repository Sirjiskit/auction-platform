/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { CreateUserDto, LoginDto } from '../dto/user.dto';
import express from 'express';
import { AuthService } from './auth.service';
import { ValidationExceptionFilter } from '../exceptions/validation-exception.filter';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Get('login')
  @Render('auth/login')
  getLoginPage() {
    return {
      title: 'Login',
      layout: 'layouts/auth',
      year: new Date().getFullYear(),
    };
  }
  @Post('login')
  @UseFilters(ValidationExceptionFilter)
  async login(
    @Body() dto: LoginDto,
    @Res() res: express.Response,
    @Req() req: express.Request,
  ) {
    try {
      const { error, result } = await this.auth.login(dto);
      if (error) {
        return res.render('auth/login', {
          title: 'Login',
          layout: 'layouts/auth',
          error: result,
          old: dto,
        });
      }
      req.session.user = result;
      return res.redirect('/');
    } catch (e: any) {
      return res.render('auth/login', {
        title: 'Login',
        layout: 'layouts/auth',
        errors: e.response.message ?? 'Uknown error occurred',
        old: dto,
      });
    }
  }
  @Get('register')
  @Render('auth/register')
  getRegisterPage() {
    return {
      title: 'Register',
      layout: 'layouts/auth',
      year: new Date().getFullYear(),
    };
  }
  @Post('register')
  @UseFilters(ValidationExceptionFilter)
  async register(@Body() userDto: CreateUserDto, @Res() res: express.Response) {
    try {
      const { error, result } = await this.auth.register(userDto);
      if (error) {
        return res.render('auth/register', {
          title: 'Register',
          layout: 'layouts/auth',
          error: result,
          old: userDto,
        });
      }
      return res.render('auth/register', {
        title: 'Register',
        layout: 'layouts/auth',
        success: 'Your account successfully created, you can now login',
      });
    } catch (e: any) {
      return res.render('auth/register', {
        title: 'Register',
        layout: 'layouts/auth',
        errors: e.response.message ?? 'Uknown error occurred',
        old: userDto,
      });
    }
  }
}
