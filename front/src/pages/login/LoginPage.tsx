import { useLogin } from './useLogin';
import { EmailStep } from './EmailStep';
import { OtpStep } from './otpStep/OtpStep';
import { VersionBadge } from '../../components/atoms/VersionBadge';

export function LoginPage() {
  const { step, email, setEmail, otp, setOtp, loading, cooldown, otpInvalidated, sendOtp, verifyOtp, backToEmail } = useLogin();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-white font-bold text-3xl">ilipro</span>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          {step === 'email' ? (
            <EmailStep
              email={email}
              loading={loading}
              onChange={setEmail}
              onSubmit={sendOtp}
            />
          ) : (
            <OtpStep
              email={email}
              otp={otp}
              loading={loading}
              cooldown={cooldown}
              otpInvalidated={otpInvalidated}
              onChange={setOtp}
              onVerify={verifyOtp}
              onResend={sendOtp}
              onBack={backToEmail}
            />
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4">
        <VersionBadge />
      </div>
    </div>
  );
}
