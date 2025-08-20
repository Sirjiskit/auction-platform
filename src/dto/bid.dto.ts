import { Expose, Type } from 'class-transformer';
import { AuctionDto } from './aution.dto';
import { OwnerDto } from './user.dto';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
export class BidDto {
  @Expose()
  id!: string;

  @Expose()
  amount!: string;

  @Expose()
  createdAt!: Date;

  @Type(() => AuctionDto)
  auction?: AuctionDto;

  @Type(() => OwnerDto)
  bidder?: OwnerDto;
}

export class PlaceBidDto {
  @IsUUID()
  @IsNotEmpty()
  auctionId!: string;

  @IsNumber()
  @Min(1, { message: 'Bid amount must be at least ₦1' })
  amount!: number;
}
