/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Render,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard';
import { BidsService } from './bids.service';
import { PlaceBidDto } from '../dto/bid.dto';
import type { Request } from 'express';
@UseGuards(AuthGuard)
@Controller('bids')
export class BidsController {
  constructor(private readonly bids: BidsService) {}
  @Get()
  @Render('bids')
  async getBids(@Req() req: Request) {
    if (!req.session.user) {
      return new UnauthorizedException();
    }
    const { id } = req.session.user;
    if (!id) return new UnauthorizedException();
    const result = await this.bids.findOngoingAutions();
    return {
      title: 'Autions',
      layout: 'layouts/main',
      isBids: true,
      list: result,
      user: req.session.user,
      year: new Date().getFullYear(),
    };
  }
  @Post()
  async placeBid(@Body() dto: PlaceBidDto, @Req() req: Request) {
    try {
      if (!req.session?.user) {
        throw new UnauthorizedException();
      }

      const { id } = req.session.user;
      if (!id) throw new UnauthorizedException();

      const { error, result } = await this.bids.placeBid(dto, id);

      if (error) {
        throw new HttpException(result, HttpStatus.BAD_REQUEST);
      }

      // ✅ return a proper success response
      return {
        success: true,
        message: result,
        data: result,
      };
    } catch (e: any) {
      console.error(e);
      if (e instanceof HttpException) {
        throw e; // re-throw known exceptions
      }
      throw new InternalServerErrorException(
        'Something went wrong while placing the bid',
      );
    }
  }
  @Get('result')
  @Render('result')
  async getResult(@Req() req: Request) {
    if (!req.session.user) {
      return new UnauthorizedException();
    }
    const { id } = req.session.user;
    if (!id) return new UnauthorizedException();
    const result = await this.bids.auctionResult(id);
    console.log(result);
    return {
      title: 'Autions result',
      layout: 'layouts/main',
      isResult: true,
      list: result,
      user: req.session.user,
      year: new Date().getFullYear(),
    };
  }
}
