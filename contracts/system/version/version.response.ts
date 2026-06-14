export interface VersionResponse {
  version: string;
}

export class VersionResponseClass {
  static fromJson(json: unknown): VersionResponse {
    return json as VersionResponse;
  }
}
