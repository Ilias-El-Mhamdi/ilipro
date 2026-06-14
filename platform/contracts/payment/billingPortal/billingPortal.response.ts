export interface BillingPortalResponse {
  url: string;
}

export class BillingPortalResponseClass {
  static fromJson(json: unknown): BillingPortalResponse {
    return json as BillingPortalResponse;
  }
}
