export interface GetProjectDeliverableDownloadResponse {
  url: string;
}

export class GetProjectDeliverableDownloadResponseClass {
  static fromJson(json: unknown): GetProjectDeliverableDownloadResponse {
    return json as GetProjectDeliverableDownloadResponse;
  }
}
