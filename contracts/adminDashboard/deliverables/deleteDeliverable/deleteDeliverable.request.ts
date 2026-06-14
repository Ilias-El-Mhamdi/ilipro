export class DeleteDeliverableRequest {
  static BASE_URL = "/deliverables/:id";
  static buildUrl(id: string) {
    return `/deliverables/${id}`;
  }
}
