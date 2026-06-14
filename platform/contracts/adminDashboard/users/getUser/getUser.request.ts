export class GetUserRequest {
  static BASE_URL = "/users/:id";
  static buildUrl(id: string) {
    return `/users/${id}`;
  }
}
