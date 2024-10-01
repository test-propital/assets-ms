import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetDto } from './create-asset.dto';
import { IsOptional, IsEnum, IsString, IsPositive } from 'class-validator';

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  id: number;
  @IsOptional()
  @IsEnum(['House', 'Apartment', 'Land', 'Building', 'Other'])
  assetType?: 'House' | 'Apartment' | 'Land' | 'Building' | 'Other';

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsPositive()
  value?: number;

  @IsOptional()
  acquisitionDate?: Date;

  @IsOptional()
  @IsPositive()
  rentalIncome?: number;

  @IsOptional()
  ownerId?: number;

  @IsOptional()
  @IsPositive()
  areaSqm?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['Available', 'Occupied', 'ForSale', 'Rented'])
  status?: 'Available' | 'Occupied' | 'ForSale' | 'Rented';
}
