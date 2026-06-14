export class GetDeliverableRequest {
  static BASE_URL = "/deliverables/:id";
  static buildUrl(id: string) {
    return `/deliverables/${id}`;
  }
}
