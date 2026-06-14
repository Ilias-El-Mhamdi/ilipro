export class ActivateLicenseResponse {
  declare valid: true;

  static fromJson(json: unknown): ActivateLicenseResponse {
    return json as ActivateLicenseResponse;
  }
}
