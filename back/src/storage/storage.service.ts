export interface UploadResult {
  url: string;
  storageKey: string;
}

export abstract class StorageService {
  abstract upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<UploadResult>;

  abstract delete(storageKey: string): Promise<void>;
}
