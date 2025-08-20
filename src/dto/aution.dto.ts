import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { OwnerDto } from './user.dto';
import { BidDto } from './bid.dto';

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description!: string;

  @IsDateString(
    {},
    { message: 'End time must be a valid date string (ISO format)' },
  )
  @IsNotEmpty({ message: 'End time is required' })
  endsAt!: Date;
}

export class AuctionDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  description?: string;

  @Expose()
  endsAt!: Date;

  @Expose()
  createdAt!: Date;

  @Type(() => OwnerDto)
  owner?: OwnerDto;

  @Type(() => BidDto)
  bids?: BidDto[];
}
