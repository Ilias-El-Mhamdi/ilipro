export class UploadProjectDeliverableRequest {
  static BASE_URL = "/projects/:projectId/deliverables";
  static buildUrl(projectId: string) {
    return `/projects/${projectId}/deliverables`;
  }
}
