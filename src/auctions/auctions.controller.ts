/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard';
import { ValidationExceptionFilter } from 'src/exceptions/validation-exception.filter';
import { CreateAuctionDto } from '../dto/aution.dto';
import { AuctionsService } from './auctions.service';
import type { Request, Response } from 'express';
@UseGuards(AuthGuard)
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly aution: AuctionsService) {}
  @Get()
  @Render('auction')
  async getAuctions(@Req() req: Request) {
    if (!req.session.user) {
      return new UnauthorizedException();
    }
    const { id } = req.session.user;
    if (!id) return new UnauthorizedException();
    const { result } = await this.aution.getAutions(id);
    return {
      title: 'Autions',
      layout: 'layouts/main',
      isAutions: true,
      list: result,
      user: req.session.user,
      year: new Date().getFullYear(),
    };
  }
  @Post()
  @UseFilters(ValidationExceptionFilter)
  async postAuctions(
    @Body() dto: CreateAuctionDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      if (!req.session.user) {
        return new UnauthorizedException();
      }
      const { id } = req.session.user;
      if (!id) return new UnauthorizedException();
      const { error, result } = await this.aution.createAution(dto, id);
      if (error) {
        const { result: list } = await this.aution.getAutions(id);
        return res.render('auction', {
          title: 'Autions',
          layout: 'layouts/main',
          error: result,
          isAutions: true,
          list: list ?? [],
          user: req.session.user,
          year: new Date().getFullYear(),
          old: dto,
        });
      }
      const { result: list } = await this.aution.getAutions(id);
      return res.render('auction', {
        title: 'Autions',
        layout: 'layouts/main',
        success: result,
        list: list ?? [],
        isAutions: true,
        user: req.session.user,
        year: new Date().getFullYear(),
      });
    } catch (e: any) {
      return res.render('auction', {
        title: 'Autions',
        layout: 'layouts/main',
        error: e.message ?? 'Unknown error occurred',
        isAutions: true,
        list: [],
        user: req.session.user,
        year: new Date().getFullYear(),
        old: dto,
      });
    }
  }
}
