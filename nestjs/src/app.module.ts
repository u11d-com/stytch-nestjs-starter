import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ResourceModule } from './resource/resource.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { CacheModule } from '@nestjs/cache-manager/dist/cache.module';
import { createKeyv } from '@keyv/redis';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        const url = process.env.REDIS_URL || 'redis://localhost:6379';

        return {
          stores: createKeyv(url),
        };
      },
    }),
    DatabaseModule,
    AuthModule,
    ResourceModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
