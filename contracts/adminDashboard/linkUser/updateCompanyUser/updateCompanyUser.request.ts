export class UpdateCompanyUserRequest {
  static BASE_URL = "/companies/:companySlug/users/:userId";
  static buildUrl(companySlug: string, userId: string) {
    return `/companies/${companySlug}/users/${userId}`;
  }
}
