import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import type { UploadResult } from './storage.service';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class BunnyStorageService extends StorageService {
  private readonly apiKey: string;
  private readonly zone: string;
  private readonly cdnBase: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.apiKey = this.config.get<string>('BUNNY_API_KEY', '');
    this.zone = this.config.get<string>('BUNNY_ZONE', '');
    this.cdnBase = this.config.get<string>('BUNNY_CDN_BASE', '');
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const ext = extname(filename);
    const storageKey = `${randomUUID()}${ext}`;

    const res = await fetch(
      `https://storage.bunnycdn.com/${this.zone}/${storageKey}`,
      {
        method: 'PUT',
        headers: {
          AccessKey: this.apiKey,
          'Content-Type': mimeType,
        },
        body: buffer as unknown as BodyInit,
      },
    );

    if (!res.ok) {
      throw new Error(`Bunny upload failed: ${res.status} ${await res.text()}`);
    }

    const url = `${this.cdnBase}/${storageKey}`;
    return { url, storageKey };
  }

  async delete(storageKey: string): Promise<void> {
    await fetch(`https://storage.bunnycdn.com/${this.zone}/${storageKey}`, {
      method: 'DELETE',
      headers: { AccessKey: this.apiKey },
    });
  }
}
