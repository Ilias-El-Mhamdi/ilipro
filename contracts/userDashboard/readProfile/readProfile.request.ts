export class ReadProfileRequest {
  static BASE_URL = "/users/slug/:slug";
  static buildUrl(slug: string) {
    return `/users/slug/${slug}`;
  }
}
