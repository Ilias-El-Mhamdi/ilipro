export interface GetDeliverableDownloadResponse {
  url: string;
}

export class GetDeliverableDownloadResponseClass {
  static fromJson(json: unknown): GetDeliverableDownloadResponse {
    return json as GetDeliverableDownloadResponse;
  }
}
