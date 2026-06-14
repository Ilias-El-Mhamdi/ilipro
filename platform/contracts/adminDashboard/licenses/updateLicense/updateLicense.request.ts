export class UpdateLicenseRequest {
  static BASE_URL = "/licenses/:id";
  static buildUrl(id: string) {
    return `/licenses/${id}`;
  }
}
