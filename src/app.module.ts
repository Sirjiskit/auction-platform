import { BidsService } from './bids/bids.service';
import { BidsController } from './bids/bids.controller';
import { AuctionsService } from './auctions/auctions.service';
import { AuctionsController } from './auctions/auctions.controller';
import { PrismaService } from './utils/prisma.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { OpenAIService } from './utils/openai.service';
import { AuctionGateway } from './sockets/socket.gateway';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    BidsController,
    AuctionsController,
    AuthController,
    AppController,
  ],
  providers: [
    BidsService,
    AuctionsService,
    PrismaService,
    AuthService,
    AppService,
    OpenAIService,
    AuctionGateway,
  ],
})
export class AppModule {}
