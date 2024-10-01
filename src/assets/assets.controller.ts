import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { CreateAssetEventDto } from './dto/create-event.dt';
import { paginationDto } from 'src/common';

@Controller()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @MessagePattern({ cmd: 'create_owner' })
  async createOwner(@Payload() createOwnerDto: CreateOwnerDto) {
    return this.assetsService.createOwner(createOwnerDto);
  }

  @MessagePattern({ cmd: 'get_owners' })
  async getOwners() {
    return this.assetsService.getOwners();
  }

  @MessagePattern({ cmd: 'get_owner_by_id' })
  async getOwnerById(@Payload() payload: { id: number }) {
    const owner = await this.assetsService.getOwnerById(payload.id);
    return owner;
  }
  @MessagePattern({ cmd: 'get_owner_by_authId' })
  async getOwnerByIdAuth(@Payload() payload) {
    const owner = await this.assetsService.getOwnerByIdAuth(payload);
    return owner;
  }

  @MessagePattern({ cmd: 'delete_owner' })
  async deleteOwner(@Payload() payload: { id: number }) {
    return this.assetsService.deleteOwner(payload.id);
  }

  @MessagePattern({ cmd: 'create_asset' })
  async createAsset(@Payload() createAssetDto: CreateAssetDto) {
    return this.assetsService.createAsset(createAssetDto);
  }

  @MessagePattern({ cmd: 'get_asset_by_id' })
  async getAssetById(@Payload() id: string) {
    const asset = await this.assetsService.getAssetById(id);
    return asset;
  }
  @MessagePattern({ cmd: 'get_assets_by_owner_id' })
  async getAssetByOwnerId(
    @Payload() payload: { id: number; paginationDto: paginationDto },
  ) {
    const { id, paginationDto } = payload;
    const asset = await this.assetsService.getAssetByOwnerId(id, paginationDto);
    return asset;
  }
  @MessagePattern({ cmd: 'count_assets_by_owner_id' })
  async countAssetsByOwnerId(@Payload() payload: { id: number }) {
    const { id } = payload;
    const asset = await this.assetsService.countAssetsByOwnerId(id);
    return asset;
  }

  @MessagePattern({ cmd: 'update_asset' })
  async updateAsset(
    @Payload() payload: { id: number; updateAssetDto: UpdateAssetDto },
  ) {
    return this.assetsService.updateAsset(payload.id, payload.updateAssetDto);
  }

  @MessagePattern({ cmd: 'delete_asset' })
  async deleteAsset(@Payload() payload: { id: number }) {
    return this.assetsService.deleteAsset(payload.id);
  }

  // Funciones para gestionar AssetEvents
  @MessagePattern({ cmd: 'create_asset_event' })
  async createAssetEvent(
    @Payload()
    payload: {
      assetId: number;
      createAssetEventDto: CreateAssetEventDto;
    },
  ) {
    return this.assetsService.createAssetEvent(
      payload.assetId,
      payload.createAssetEventDto,
    );
  }
  @MessagePattern({ cmd: 'random_asset_event' })
  async generateRandomAssetEventForUser(
    @Payload()
    payload: {
      id: number;
      authId: string;
    },
  ) {
    console.log(payload);
    const result = await this.assetsService.generateRandomAssetEventForUser(
      payload.id,
      payload.authId,
    );

    return result;
  }

  @MessagePattern({ cmd: 'get_asset_events' })
  async getAssetEvents(@Payload() payload: { assetId: number }) {
    return this.assetsService.getAssetEvents(payload.assetId);
  }
}
