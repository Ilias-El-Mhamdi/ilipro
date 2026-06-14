export class SendOtpRequest {
  static BASE_URL = "/auth/send-otp";
  static buildUrl() {
    return SendOtpRequest.BASE_URL;
  }
}

export interface SendOtpBody {
  email: string;
}
