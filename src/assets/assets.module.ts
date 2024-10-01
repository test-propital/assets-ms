import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaModule } from 'src/prisma_module/prisma.module';
import { NastModule } from 'src/transports/nast.module';

@Module({
  imports: [PrismaModule, NastModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
