import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma_module/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { Asset, AssetEvent, EventType, Owner } from '@prisma/client';
import { CreateAssetEventDto } from './dto/create-event.dt';
import { catchError, firstValueFrom } from 'rxjs';
import { NAST_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { paginationDto } from 'src/common';

@Injectable()
export class AssetsService {
  constructor(
    @Inject(NAST_SERVICE) private readonly nastClient: ClientProxy,
    private prisma: PrismaService,
  ) {}

  // Funciones para gestionar Owners
  async createOwner(createOwnerDto: CreateOwnerDto): Promise<Owner> {
    try {
      return await this.prisma.owner.create({
        data: createOwnerDto,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create owner');
    }
  }

  async getOwners(): Promise<Owner[]> {
    try {
      return await this.prisma.owner.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve owners');
    }
  }

  async getOwnerById(id: number): Promise<Owner> {
    try {
      const owner = await this.prisma.owner.findUnique({
        where: { id },
        include: {
          assets: true,
        },
      });
      if (!owner) {
        throw new NotFoundException(`Owner with id ${id} not found`);
      }
      return owner;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve owner');
    }
  }

  async getOwnerByIdAuth(id: string): Promise<Owner> {
    try {
      const owner = await this.prisma.owner.findFirst({
        where: { authId: id },
      });
      if (!owner) {
        throw new NotFoundException(`Owner with id ${id} not found`);
      }
      return owner;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve owner');
    }
  }

  async deleteOwner(id: number): Promise<Owner> {
    try {
      const owner = await this.prisma.owner.delete({
        where: { id },
      });
      return owner;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete owner');
    }
  }

  async createAsset(createAssetDto: CreateAssetDto) {
    const { ownerId } = createAssetDto;

    // Validar si el owner existe
    const owner = await this.prisma.owner.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    try {
      const newAsset = await this.prisma.asset.create({
        data: createAssetDto,
      });

      // Crear un evento asociado al nuevo asset
      const eventData = {
        eventType: EventType.Created, // Tipo de evento "Created"
        description: `Asset created with type: ${newAsset.assetType} at address: ${newAsset.address}`,
      };
      const event = await this.createAssetEvent(
        newAsset.id,
        eventData,
        owner.authId,
        newAsset.assetId,
      );

      return { newAsset, event };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create asset');
    }
  }

  async getAssetById(id: string): Promise<Asset> {
    try {
      const asset = await this.prisma.asset.findFirst({
        where: { assetId: id },
        include: {
          owner: true,
          events: true,
        },
      });
      if (!asset) {
        throw new NotFoundException(`Asset with id ${id} not found`);
      }
      return asset;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve asset');
    }
  }
  async getAssetByOwnerId(id: number, paginationDto: paginationDto) {
    const { page, limit } = paginationDto;

    try {
      const totalCount = await this.prisma.asset.count({
        where: {
          ownerId: id,
        },
      });

      const totalPages = Math.ceil(totalCount / limit);

      const assets = await this.prisma.asset.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          ownerId: id,
        },
        include: {
          events: true,
        },
      });

      return {
        data: assets,
        meta: {
          page: page,
          totalCount: totalCount,
          totalPages: totalPages,
          limit: limit,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve asset');
    }
  }
  async countAssetsByOwnerId(id: number): Promise<number> {
    try {
      const assetCount = await this.prisma.asset.count({
        where: {
          ownerId: id,
        },
      });
      return assetCount;
    } catch (error) {
      throw new InternalServerErrorException('Failed to count assets');
    }
  }

  async updateAsset(
    id: number,
    updateAssetDto: UpdateAssetDto,
  ): Promise<Asset> {
    try {
      return await this.prisma.asset.update({
        where: { id },
        data: {
          ...updateAssetDto,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update asset');
    }
  }

  async deleteAsset(id: number): Promise<Asset> {
    try {
      return await this.prisma.asset.delete({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete asset');
    }
  }

  // Funciones para gestionar AssetEvents
  async createAssetEvent(
    assetId: number,
    createAssetEventDto: CreateAssetEventDto,
    authId?: string,
    assetUUID?: string,
  ) {
    try {
      const event = await this.prisma.assetEvent.create({
        data: {
          assetId,
          ...createAssetEventDto,
        },
      });
      const ref = {
        message: `${event.description} `,
        userId: authId,
        assetId: assetUUID,
        assetEventId: event.assetEventId,
      };
      console.log(ref);
      const notification = await firstValueFrom(
        this.nastClient.send({ cmd: 'create_notification' }, ref).pipe(
          catchError((err) => {
            // Si ocurre un error, lanzar una excepción para revertir la transacción
            throw new RpcException(err);
          }),
        ),
      );
      return {
        event,
        notification,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create asset event');
    }
  }

  async generateRandomAssetEventForUser(userId: number, authId: string) {
    console.log(authId);
    try {
      // 1. Obtener un asset aleatorio del usuario
      const assets = await this.prisma.asset.findMany({
        where: { ownerId: userId },
        select: {
          id: true,
          assetId: true,
          assetType: true,
          address: true,
          value: true,
          acquisitionDate: true,
          rentalIncome: true,
          ownerId: true,
          areaSqm: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          events: true,
        },
      });

      if (assets.length === 0) {
        throw new NotFoundException('El usuario no tiene activos disponibles');
      }

      // Seleccionar un asset aleatorio
      const randomAsset = assets[Math.floor(Math.random() * assets.length)];

      // 2. Generar un tipo de evento aleatorio del enum EventType
      const eventTypes = Object.values(EventType); // Obtener todos los posibles tipos de eventos
      const randomEventType =
        eventTypes[Math.floor(Math.random() * eventTypes.length)];

      // 3. Crear un evento aleatorio para el asset seleccionado
      const eventDescription = `Evento generado aleatoriamente: ${randomEventType}`;

      const newEvent = await this.prisma.assetEvent.create({
        data: {
          assetId: randomAsset.id,
          eventType: randomEventType,
          description: eventDescription,
        },
      });
      console.log('---------------------------ref');
      const ref = {
        message: `${newEvent.description}`,
        userId: authId,
        assetId: randomAsset.assetId,
        assetEventId: newEvent.assetEventId,
      };
      console.log(ref);

      // Enviar la notificación
      const notification = await firstValueFrom(
        this.nastClient.send({ cmd: 'create_notification' }, ref).pipe(
          catchError((err) => {
            throw new RpcException(err);
          }),
        ),
      );
      console.log(notification);
      return {
        message: 'Evento creado exitosamente',
        event: newEvent,
        notification: notification,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al generar el evento aleatorio',
      );
    }
  }

  async getAssetEvents(assetId: number): Promise<AssetEvent[]> {
    try {
      return await this.prisma.assetEvent.findMany({
        where: { assetId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve asset events');
    }
  }
}
