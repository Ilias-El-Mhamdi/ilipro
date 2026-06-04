import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MinioStorageService } from './minio-storage.service';
import { BunnyStorageService } from './bunny-storage.service';

// Switch provider here to change storage backend: MinioStorageService | BunnyStorageService
const activeStorage = MinioStorageService;

@Module({
  providers: [
    MinioStorageService,
    BunnyStorageService,
    { provide: StorageService, useClass: activeStorage },
  ],
  exports: [StorageService],
})
export class StorageModule {}
