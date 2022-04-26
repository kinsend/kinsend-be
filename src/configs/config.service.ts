/* eslint-disable unicorn/prefer-node-protocol */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/lines-between-class-members */
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };
  constructor() {
    this.envConfig = dotenv.parse(fs.readFileSync('.env'));
  }
  private int(value: string | undefined, number: number): number {
    return value
      ? Number.isNaN(Number.parseInt(value))
        ? number
        : Number.parseInt(value)
      : number;
  }

  private bool(value: string | undefined, boolean: boolean): boolean {
    return value === null || value === undefined ? boolean : value === 'true';
  }

  private cors(value: string | undefined): string[] | 'all' {
    if (value === 'all' || value === undefined) {
      return 'all';
    }

    return value ? value.split(',').map((name) => name.trim()) : ['http://localhost:3000'];
  }

  get postgresConnection(): string {
    return process.env.DATABASE_URL || this.envConfig['DATABASE_URL'] || '';
  }

  get redisClusterMode(): 'nats_cluster' | 'aws_elasticache' | 'local_cluster' {
    const mode = process.env.REDIS_CLUSTER_MODE || this.envConfig['REDIS_CLUSTER_MODE'] || '';
    if (mode && ['nats_cluster', 'aws_elasticache', 'local_cluster'].includes(mode)) {
      return mode as 'nats_cluster' | 'aws_elasticache' | 'local_cluster';
    }
    return 'local_cluster';
  }

  get redisClusterHost(): string {
    return process.env.REDIS_CLUSTER_HOST || this.envConfig['REDIS_CLUSTER_HOST'] || '127.0.0.1';
  }

  get redisClusterPort(): number {
    return this.int(process.env.REDIS_CLUSTER_PORT || this.envConfig['REDIS_CLUSTER_PORT'], 6000);
  }

  get redisClusterSlaveRead(): string {
    const defaultMode = 'never';
    const redisClusterSlaveRead =
      process.env.REDIS_CLUSTER_SLAVE_READ || this.envConfig['REDIS_CLUSTER_SLAVE_READ'] || '';
    if (!redisClusterSlaveRead) {
      return defaultMode;
    }

    return ['never', 'share', 'always'].includes(redisClusterSlaveRead)
      ? redisClusterSlaveRead
      : defaultMode;
  }
  get apiKey(): string {
    return process.env.API_KEY || this.envConfig['API_KEY'] || '';
  }
  get useRedisCluster(): boolean {
    return this.bool(process.env.USE_REDIS_CLUSTER || this.envConfig['USE_REDIS_CLUSTER'], false);
  }
  get redisHost(): string {
    return process.env.REDIS_HOST || this.envConfig['REDIS_HOST'] || '';
  }
  get redisPort(): number {
    return this.int(process.env.REDIS_PORT || this.envConfig['REDIS_PORT'], 6379);
  }
  get redisPrefix(): string {
    return this.bool(
      process.env.INTEGRATION_TESTING || this.envConfig['INTEGRATION_TESTING'],
      false,
    ) === true
      ? 'db-integration-test'
      : 'dbtest';
  }
  get jwtSecret(): string {
    return process.env.JWT_SECRET || this.envConfig['JWT_SECRET'] || 'test';
  }

  get accessTokenExpiry(): string {
    return process.env.ACCESS_TOKEN_EXPIRY || this.envConfig['ACCESS_TOKEN_EXPIRY'] || '7d';
  }
  get saltRounds(): number {
    return this.int(process.env.SALT_ROUNDS || this.envConfig['SALT_ROUNDS'], 10);
  }
  get preHashSalt(): string {
    return process.env.PRE_HASH_SALT || this.envConfig['PRE_HASH_SALT'] || 'test-hash';
  }
  get isPrismaLogEnabled(): boolean {
    return this.bool(
      process.env.IS_PRISMA_LOG_ENABLED || this.envConfig['IS_PRISMA_LOG_ENABLED'],
      true,
    );
  }
  get mongoDBUri(): string {
    return process.env.MONGODB_URI || this.envConfig['MONGODB_URI'] || '127.0.0.1';
  }
  get mongoDBDatabase(): string {
    return process.env.MONGODB_DATABASE || this.envConfig['MONGODB_DATABASE'] || 'mongo-local';
  }
  get host(): string {
    return process.env.HOST || this.envConfig['HOST'] || '127.0.0.1';
  }
  get port(): number {
    return this.int(process.env.PORT || this.envConfig['PORT'], 3131);
  }

  get timeToLive(): number {
    return this.int(
      this.envConfig[process.env.REDIS_CACHE_EXPIRES_IN || 'REDIS_CACHE_EXPIRES_IN'],
      60 * 60 * 24 * 7,
    );
  }
  get corsAllowedOrigins(): string[] | string {
    return this.cors(process.env.CORS_ALLOWED_ORIGINS || 'all');
  }
  get corsEnabled(): boolean {
    return this.bool(process.env.CORS_ENABLED || this.envConfig['CORS_ENABLED'], true);
  }

  get isRedisCluster(): boolean {
    return this.bool(process.env.IS_REDIS_CLUSTER || this.envConfig['IS_REDIS_CLUSTER'], false);
  }

  get isIntegrationTest(): boolean {
    return this.bool(
      process.env.IS_INTEGRATION_TESTING || this.envConfig['IS_INTEGRATION_TESTING'],
      false,
    );
  }

  get environment(): string {
    return process.env.NODE_ENV || this.envConfig['NODE_ENV'] || 'development';
  }

  get sendGridApiKey(): string {
    return process.env.SEND_GRID_API_KEY || this.envConfig['SEND_GRID_API_KEY'] || '';
  }

  get baseUrl(): string {
    return process.env.BASE_URL || this.envConfig['BASE_URL'] || 'http://localhost:3131';
  }

  get mailForm(): string {
    return process.env.MAIL_FROM || this.envConfig['MAIL_FROM'] || '';
  }
  get twilioAccountSid(): string {
    return process.env.TWILIO_ACCOUNT_SID || this.envConfig['TWILIO_ACCOUNT_SID'] || '';
  }
  get twilioAuthToken(): string {
    return process.env.TWILIO_AUTH_TOKEN || this.envConfig['TWILIO_AUTH_TOKEN'] || '';
  }
  get twilioVerificationServiceSid(): string {
    return (
      process.env.TWILIO_VERIFICATION_SERVICE_SID ||
      this.envConfig['TWILIO_VERIFICATION_SERVICE_SID'] ||
      ''
    );
  }
}
