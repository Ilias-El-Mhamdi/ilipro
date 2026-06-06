export abstract class IOtpRepository {
  abstract setOtp(userId: string, otp: string, otpExpiry: Date): Promise<void>;
  abstract incrementAttempts(userId: string): Promise<number>;
  abstract clear(userId: string): Promise<void>;
}
