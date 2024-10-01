import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateAssetDto {
  @IsNotEmpty()
  @IsEnum(['House', 'Apartment', 'Land', 'Building', 'Other'])
  assetType: 'House' | 'Apartment' | 'Land' | 'Building' | 'Other';

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsPositive()
  value: number;

  @IsOptional()
  acquisitionDate?: Date;

  @IsOptional()
  @IsPositive()
  rentalIncome?: number;

  @IsNotEmpty()
  ownerId: number;

  @IsOptional()
  @IsPositive()
  areaSqm?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(['Available', 'Occupied', 'ForSale', 'Rented'])
  status: 'Available' | 'Occupied' | 'ForSale' | 'Rented';
}
