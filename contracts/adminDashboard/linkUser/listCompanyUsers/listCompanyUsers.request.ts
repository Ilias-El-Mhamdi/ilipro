export class ListCompanyUsersRequest {
  static BASE_URL = "/companies/:companySlug/users";
  static buildUrl(companySlug: string) {
    return `/companies/${companySlug}/users`;
  }
}
