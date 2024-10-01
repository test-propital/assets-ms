import { Module } from '@nestjs/common';
import { AssetsModule } from './assets/assets.module';

@Module({
  imports: [AssetsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
