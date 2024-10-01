import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateOwnerDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  authId: string;
}
