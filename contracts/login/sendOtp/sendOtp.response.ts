export interface SendOtpResponse {
  message: string;
}

export class SendOtpResponseClass {
  static fromJson(json: unknown): SendOtpResponse {
    return json as SendOtpResponse;
  }
}
