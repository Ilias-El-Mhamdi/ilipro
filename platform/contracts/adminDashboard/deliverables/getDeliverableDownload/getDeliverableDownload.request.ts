export class GetDeliverableDownloadRequest {
  static BASE_URL = "/deliverables/:id/download";
  static buildUrl(id: string) {
    return `/deliverables/${id}/download`;
  }
}
