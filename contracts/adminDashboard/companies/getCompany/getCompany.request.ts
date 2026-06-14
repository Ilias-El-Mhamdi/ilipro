export class GetCompanyRequest {
  static BASE_URL = "/companies/:slug";
  static buildUrl(slug: string) {
    return `/companies/${slug}`;
  }
}
