import { OtpForm } from './OtpForm';
import { OtpInvalidated } from './OtpInvalidated';

interface Props {
  email: string;
  otp: string;
  loading: boolean;
  cooldown: number;
  otpInvalidated: boolean;
  onChange: (value: string) => void;
  onVerify: (value: string) => void;
  onResend: () => void;
  onBack: () => void;
}

export function OtpStep({ email, otp, loading, cooldown, otpInvalidated, onChange, onVerify, onResend, onBack }: Props) {
  return (
    <>
      <h2 className="text-white font-semibold text-lg mb-1">Vérification</h2>
      <p className="text-gray-400 text-sm mb-6">
        Code envoyé à <span className="text-gray-300">{email}</span>
      </p>

      {otpInvalidated ? (
        <OtpInvalidated loading={loading} cooldown={cooldown} onResend={onResend} />
      ) : (
        <OtpForm otp={otp} loading={loading} cooldown={cooldown} onChange={onChange} onVerify={onVerify} onResend={onResend} />
      )}

      <button
        type="button"
        onClick={onBack}
        className="w-full text-gray-600 text-xs mt-3 hover:text-gray-500 transition-colors"
      >
        Changer d'email
      </button>
    </>
  );
}
