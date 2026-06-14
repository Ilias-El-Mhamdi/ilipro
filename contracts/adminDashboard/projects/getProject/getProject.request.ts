export class GetProjectRequest {
  static BASE_URL = "/projects/:id";
  static buildUrl(id: string) {
    return `/projects/${id}`;
  }
}
