interface Props {
  loading: boolean;
  cooldown: number;
  onResend: () => void;
}

export function OtpInvalidated({ loading, cooldown, onResend }: Props) {
  const resendLabel = loading ? 'Envoi…' : cooldown > 0 ? `Renvoyer un code (${cooldown}s)` : 'Renvoyer un code';

  return (
    <div className="space-y-4">
      <p className="text-amber-400 text-sm text-center">Code invalidé après 3 tentatives.</p>
      <button
        onClick={onResend}
        disabled={loading || cooldown > 0}
        className="w-full bg-white text-gray-900 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {resendLabel}
      </button>
    </div>
  );
}
