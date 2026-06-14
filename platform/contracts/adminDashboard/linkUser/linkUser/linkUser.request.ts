export class LinkUserRequest {
  static BASE_URL = "/companies/:companySlug/users/:userId/link";
  static buildUrl(companySlug: string, userId: string) {
    return `/companies/${companySlug}/users/${userId}/link`;
  }
}
