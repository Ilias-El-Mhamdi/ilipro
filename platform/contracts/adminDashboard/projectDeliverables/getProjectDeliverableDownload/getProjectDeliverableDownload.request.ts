export class GetProjectDeliverableDownloadRequest {
  static BASE_URL = "/projects/:projectId/deliverables/:deliverableId/download";
  static buildUrl(projectId: string, deliverableId: string) {
    return `/projects/${projectId}/deliverables/${deliverableId}/download`;
  }
}
