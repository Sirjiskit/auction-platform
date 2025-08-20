import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './guard/auth.guard';
import express from 'express';

@UseGuards(AuthGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async getDashboard(@Req() req: express.Request) {
    if (!req.session.user) {
      return new UnauthorizedException();
    }
    const { id } = req.session.user;
    if (!id) return new UnauthorizedException();
    const stat = await this.appService.getStat(id);
    return {
      title: 'Dasboard',
      layout: 'layouts/main',
      isDashboard: true,
      user: req.session.user,
      stat: stat,
      year: new Date().getFullYear(),
    };
  }
  @Post('logout')
  logout(@Req() req: express.Request, @Res() res: express.Response) {
    req.session.user = undefined;
    return res.redirect('/auth/login');
  }
}
