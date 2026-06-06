import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageService } from './storage.service';
import type { UploadResult } from './storage.service';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class R2StorageService extends StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.bucket = this.config.get<string>('CLOUDFLARE_R2_BUCKET', 'ilipro');
    const endpoint = this.config.get<string>('CLOUDFLARE_S3_CLIENT');
    this.publicUrl = `${endpoint}/${this.bucket}`;

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('CLOUDFLARE_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('CLOUDFLARE_SECRET_ACCESS_KEY'),
      },
    });
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const ext = extname(filename);
    const storageKey = `${randomUUID()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
        ContentLength: buffer.length,
      }),
    );

    const url = `${this.publicUrl}/${storageKey}`;
    this.logger.log(`Uploaded ${storageKey} to R2`);
    return { url, storageKey };
  }

  async delete(storageKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      }),
    );
    this.logger.log(`Deleted ${storageKey} from R2`);
  }

  async getSignedUrl(storageKey: string, filename: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }
}
