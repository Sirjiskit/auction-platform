/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { CreateAuctionDto } from '../dto/aution.dto';

@Injectable()
export class AuctionsService extends PrismaService {
  constructor() {
    super();
  }
  async createAution(dto: CreateAuctionDto, userId: string) {
    try {
      await this.auction.create({
        data: {
          ...dto,
          endsAt: new Date(dto.endsAt),
          ownerId: userId,
        },
      });
      return { error: 0, result: 'Aution successfully created' };
    } catch (e: any) {
      console.log(e);
      return { error: 2, result: e.message };
    }
  }
  async getAutions(userId: string) {
    try {
      const list = await this.$queryRawUnsafe(
        `SELECT a.*,
                    COUNT(b.id) as "totalBids",
                    MAX(b.amount) as "highestBid"
            FROM "Auction" a
            LEFT JOIN "Bid" b ON b."auctionId" = a.id
            WHERE a."ownerId" = $1
            GROUP BY a.id
            `,
        userId,
      );
      return { error: 0, result: list };
    } catch (e: any) {
      console.log(e);
      return { error: 2, result: [] };
    }
  }
}
