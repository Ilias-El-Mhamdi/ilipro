export interface UploadResult {
  url: string;
  storageKey: string;
}

export abstract class IStorageRepo {
  abstract upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult>;

  abstract delete(storageKey: string): Promise<void>;

  abstract getSignedUrl(storageKey: string, filename: string, expiresIn?: number): Promise<string>;
}
