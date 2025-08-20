/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from './utils/prisma.service';

@Injectable()
export class AppService extends PrismaService {
  async getStat(userId: string) {
    const queryTotalAution = await this.auction.count({ select: { id: true } });
    const queryMyAution = await this.auction.count({
      select: { id: true },
      where: { ownerId: userId },
    });
    const queryBids = await this.bid.aggregate({ _max: { amount: true } });
    const queryMyBids = await this.bid.aggregate({
      _max: { amount: true },
      where: { bidderId: userId },
    });
    const queryLowerBidWinner = await this.bid.aggregate({
      where: {
        auction: { closed: true, winnerId: { not: null } },
      },
      _min: { amount: true },
    });
    const wins = await this.auction.count({
      where: {
        winnerId: userId,
      },
    });
    const losses = await this.auction.count({
      where: {
        closed: true,
        bids: {
          some: {
            bidderId: userId,
          },
        },
        NOT: {
          winnerId: userId,
        },
      },
    });
    const myBids = await this.bid.findMany({
      where: { bidderId: userId },
      select: {
        auction: {
          select: {
            title: true,
            description: true,
            closed: true,
            winner: {
              select: {
                name: true,
                address: true,
              },
            },
            bids: {
              select: {
                amount: true,
              },
              orderBy: {
                amount: 'desc',
              },
              take: 1,
            },
          },
        },
        amount: true,
      },
    });
    const formatted = myBids.map((bid) => {
      return {
        title: bid.auction.title,
        description: bid.auction.description,
        status: bid.auction.closed ? 'Closed' : 'Open',
        winnerName: bid.auction.winner?.name ?? null,
        myAmount: bid.amount,
        maxBid: bid.auction.bids[0]?.amount ?? null,
      };
    });
    const topBids = await this.bid.findMany({
      where: { bidderId: userId },
      select: {
        auction: {
          select: {
            title: true,
          },
        },
        amount: true,
      },
      orderBy: {
        amount: 'desc',
      },
      take: 5,
    });
    const formattedTopBids = topBids.map((bid) => {
      return {
        title: bid.auction.title,
        amount: bid.amount,
      };
    });

    const stat = {
      totalAuctions: queryTotalAution.id ?? 0,
      myAuctions: queryMyAution.id ?? 0,
      hb: queryBids._max.amount ?? 0,
      mhb: queryMyBids._max.amount ?? 0,
      lwb: queryLowerBidWinner._min.amount ?? 0,
      wins: wins,
      losses: losses,
      myBids: formatted,
      topBids: formattedTopBids,
    };
    return stat;
  }
}
