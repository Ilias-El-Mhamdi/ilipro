export class UpdateCompanyRequest {
  static BASE_URL = "/companies/:slug";
  static buildUrl(slug: string) {
    return `/companies/${slug}`;
  }
}
