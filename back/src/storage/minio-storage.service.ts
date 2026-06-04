import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { StorageService } from './storage.service';
import type { UploadResult } from './storage.service';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class MinioStorageService extends StorageService implements OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);
  private client: Minio.Client;
  private bucket: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.bucket = this.config.get<string>('MINIO_BUCKET', 'ilipro');
    this.client = new Minio.Client({
      endPoint: this.config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.config.get<number>('MINIO_PORT', 9000),
      useSSL: false,
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY', 'ilipro'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY', 'ilipro123'),
    });
  }

  async onModuleInit() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`Bucket "${this.bucket}" created`);
    }
    await this.client.setBucketPolicy(
      this.bucket,
      JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      }),
    );
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const ext = extname(filename);
    const storageKey = `${randomUUID()}${ext}`;

    await this.client.putObject(this.bucket, storageKey, buffer, buffer.length, {
      'Content-Type': mimeType,
    });

    const endpoint = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.config.get<number>('MINIO_PORT', 9000);
    const url = `http://${endpoint}:${port}/${this.bucket}/${storageKey}`;

    return { url, storageKey };
  }

  async delete(storageKey: string): Promise<void> {
    await this.client.removeObject(this.bucket, storageKey);
  }
}
