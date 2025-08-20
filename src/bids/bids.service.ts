/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../utils/openai.service';
import { PrismaService } from '../utils/prisma.service';
import { PlaceBidDto } from '../dto/bid.dto';
import { AuctionGateway } from '../sockets/socket.gateway';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BidsService extends PrismaService {
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly gateWay: AuctionGateway,
  ) {
    super();
  }
  async findOngoingAutions() {
    const list = await this.auction.findMany({
      include: { bids: true },
      where: {
        endsAt: {
          gt: new Date(),
        },
      },
    });

    return await Promise.all(
      list.map(async (auction) => {
        const totalBids = auction.bids.length;
        const highestBid = auction.bids.reduce(
          (max, b) => (Number(b.amount) > max ? Number(b.amount) : max),
          0,
        );

        // call OpenAI
        const thumbnail = await this.openAIService.generateThumbnail(
          auction.title,
        );

        return {
          ...auction,
          totalBids,
          highestBid,
          thumbnail,
        };
      }),
    );
  }
  async placeBid(dto: PlaceBidDto, userId: string) {
    try {
      const checkAution = await this.auction.findFirst({
        where: { id: dto.auctionId, endsAt: { gt: new Date() } },
      });
      if (!checkAution) return { error: 1, result: 'Aution already ended' };
      const checkCurrentBid = await this.bid.findFirst({
        where: { auctionId: dto.auctionId },
        select: { amount: true },
        orderBy: { amount: 'desc' },
        take: 1,
      });
      if (Number(checkCurrentBid?.amount) > dto.amount)
        return {
          error: 1,
          result: 'You cannot bid less than the current bid amount',
        };
      await this.bid.create({
        data: {
          auctionId: dto.auctionId,
          amount: dto.amount,
          bidderId: userId,
        },
      });
      const bid = await this.bid.aggregate({
        where: { auctionId: dto.auctionId },
        _count: { id: true },
        _max: { amount: true },
      });
      this.gateWay.notifyBid(
        dto.auctionId,
        Number(bid._max.amount ?? 0),
        bid._count.id,
      );
      return { error: 0, result: 'Bid successfully placed' };
    } catch (e: any) {
      console.log(e);
      return { error: 2, result: e.message };
    }
  }
  @Cron(CronExpression.EVERY_MINUTE)
  async handleAuctionClosing() {
    const now = new Date();
    console.log(now);
    const auctions = await this.auction.findMany({
      where: {
        endsAt: { lte: now },
        closed: false,
      },
    });

    for (const auction of auctions) {
      // find highest bid
      const highestBid = await this.bid.findFirst({
        where: { auctionId: auction.id },
        orderBy: { amount: 'desc' },
        include: { bidder: { select: { name: true } } },
      });

      await this.auction.update({
        where: { id: auction.id },
        data: {
          closed: true,
          winnerId: highestBid?.bidderId ?? null,
        },
      });
      this.gateWay.notifyAuctionEnd(
        auction.id,
        highestBid?.bidderId,
        Number(highestBid?.amount ?? 0),
        highestBid?.bidder.name,
      );
    }
  }
  async auctionResult(userId: string) {
    try {
      const list = await this.auction.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              bids: {
                some: {
                  bidderId: userId,
                },
              },
            },
          ],
        },
        include: {
          winner: true,
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
          },
          _count: {
            select: { bids: true },
          },
        },
      });

      return list.map((x) => {
        return {
          id: x.id,
          title: x.title,
          description: x.description,
          endsAt: x.endsAt,
          totalBids: x._count.bids, // 👈 here
          winner: {
            name: x.winner?.name,
            address: x.winner?.address,
            amount: x.bids.length > 0 ? x.bids[0].amount : null,
          },
        };
      });
    } catch (e: any) {
      console.log(e);
      return [];
    }
  }
}
