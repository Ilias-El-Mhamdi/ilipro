export class RenameCompanyRequest {
  static BASE_URL = "/companies/:slug/name";
  static buildUrl(slug: string) {
    return `/companies/${slug}/name`;
  }
}
