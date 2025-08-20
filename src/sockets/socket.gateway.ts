/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { formatAmount } from '../utils/formatter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AuctionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    console.log('✅ WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    const user = client.handshake.auth.user || client.handshake.query.userId;
    if (user) {
      void client.join(`user:${user.id}`); // join a private room
      console.log(
        `🟢 User ${user.id} connected and joined room user:${user.id}`,
      );
    }
    console.log(`🟢 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Client disconnected: ${client.id}`);
  }

  /**
   * Start broadcasting a countdown for an auction
   */
  startAuctionCountdown(
    auctionId: string,
    endTime: Date,
    interval = 1000, // 1 second updates
  ) {
    const endTimestamp = new Date(endTime).getTime();

    const countdownInterval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTimestamp - now);

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        this.notifyAuctionEnd(auctionId);
      } else {
        this.server.emit('auction-countdown', {
          auctionId,
          remaining, // in ms
          remainingSeconds: Math.floor(remaining / 1000),
        });
      }
    }, interval);
  }

  /**
   * Notify all clients that an auction has ended
   */
  notifyAuctionEnd(
    auctionId: string,
    winnerId?: string,
    price?: number,
    name?: string,
  ) {
    this.server.emit('auction-end', {
      auctionId,
      winnerId,
      price: formatAmount(price ?? 0),
      name: name,
    });
    this.server.to(`user:${winnerId}`).emit('you-win', {
      auctionId,
      winnerId,
      price: formatAmount(price ?? 0),
      name: name,
    });
  }
  notifyBid(auctionId: string, amount: number, bids: number) {
    this.server.emit('auction-bid', {
      auctionId,
      amount: formatAmount(amount),
      bids: bids,
    });
  }
}
