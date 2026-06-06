interface Props {
  otp: string;
  loading: boolean;
  cooldown: number;
  onChange: (value: string) => void;
  onVerify: (value: string) => void;
  onResend: () => void;
}

export function OtpForm({ otp, loading, cooldown, onChange, onVerify, onResend }: Props) {
  const resendLabel = loading ? 'Envoi…' : cooldown > 0 ? `Renvoyer un code (${cooldown}s)` : 'Renvoyer un code';

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onVerify(otp); }}
      className="space-y-4"
    >
      <input
        type="text"
        value={otp}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
          onChange(value);
          if (value.length === 6) onVerify(value);
        }}
        placeholder="123456"
        required
        autoFocus
        maxLength={6}
        inputMode="numeric"
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm text-center tracking-[0.4em] font-mono text-lg focus:outline-none focus:border-gray-500"
      />
      <button
        type="submit"
        disabled={loading || otp.length < 6}
        className="w-full bg-white text-gray-900 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Vérification…' : 'Se connecter'}
      </button>
      <button
        type="button"
        onClick={onResend}
        disabled={loading || cooldown > 0}
        className="w-full text-gray-500 text-sm hover:text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {resendLabel}
      </button>
    </form>
  );
}
