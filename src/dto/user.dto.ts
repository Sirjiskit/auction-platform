/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { AuctionDto } from './aution.dto';
import { BidDto } from './bid.dto';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsNotEmpty({ message: 'Full name is required' })
  name!: string;

  @IsNotEmpty({ message: 'Address is required for item delivery' })
  address!: string;
}
export class UserDto {
  @IsOptional()
  @IsUUID('4', { message: 'Invalid ID format' })
  id?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty({ message: 'Full name is required' })
  name!: string;

  @IsNotEmpty({ message: 'Address is required for item delivery' })
  address!: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class OwnerDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  name!: string;

  @Expose()
  address!: string;

  @Expose()
  createdAt!: Date;

  @Type(() => AuctionDto)
  auctions?: AuctionDto[];

  @Type(() => BidDto)
  bids?: BidDto[];

  @Exclude()
  password!: string;
}
