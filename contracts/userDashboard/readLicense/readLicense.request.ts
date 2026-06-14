export class ReadLicenseRequest {
  static BASE_URL = "/licenses/user/:userId";
  static buildUrl(userId: string) {
    return `/licenses/user/${userId}`;
  }
}
