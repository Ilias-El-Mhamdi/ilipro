export class ListCompanyProjectsRequest {
  static BASE_URL = "/companies/:companySlug/projects";
  static buildUrl(companySlug: string) {
    return `/companies/${companySlug}/projects`;
  }
}
