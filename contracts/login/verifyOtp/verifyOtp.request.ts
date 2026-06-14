export class VerifyOtpRequest {
  static BASE_URL = "/auth/verify-otp";
  static buildUrl() {
    return VerifyOtpRequest.BASE_URL;
  }
}

export interface VerifyOtpBody {
  email: string;
  otp: string;
}
