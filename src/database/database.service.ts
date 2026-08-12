import {
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
  Pool,
  PoolClient,
  QueryResultRow,
} from 'pg';

@Injectable()
export class DatabaseService
  implements OnModuleDestroy
{
  private readonly pool: Pool;

  constructor(
    private readonly config: ConfigService,
  ) {
    this.pool = new Pool({
      connectionString:
        this.config.get<string>(
          'DATABASE_URL',
        ),
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async query<
    T extends QueryResultRow = any,
  >(
    text: string,
    params?: any[],
  ) {
    return this.pool.query<T>(
      text,
      params,
    );
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}