import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Logger } from 'nestjs-pino';
import { DB_CLIENT } from './db.constants';
import * as schema from './schema';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DB_CLIENT,
      inject: [ConfigService, Logger],
      useFactory: (configService: ConfigService, logger: Logger) => {
        const db = drizzle(configService.getOrThrow<string>('DATABASE_URL'), {
          relations: schema.relations,
        });

        db.$client.on('connect', () =>
          logger.log('Connected to DB successfully'),
        );

        db.$client.on('error', (err) => logger.error(err));

        return db;
      },
    },
  ],
  controllers: [],
  exports: [DB_CLIENT],
})
export class DbModule {}
