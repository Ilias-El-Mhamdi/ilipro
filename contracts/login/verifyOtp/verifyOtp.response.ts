export interface VerifyOtpResponse {
  user: {
    slug: string;
    isAdmin: boolean;
  };
}

export class VerifyOtpResponseClass {
  static fromJson(json: unknown): VerifyOtpResponse {
    return json as VerifyOtpResponse;
  }
}
