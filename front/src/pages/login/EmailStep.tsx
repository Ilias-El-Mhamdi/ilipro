interface Props {
  email: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function EmailStep({ email, loading, onChange, onSubmit }: Props) {
  return (
    <>
      <h2 className="text-white font-semibold text-lg mb-1">Connexion</h2>
      <p className="text-gray-400 text-sm mb-6">Saisissez votre email pour recevoir un code.</p>
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        className="space-y-4"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          placeholder="votre@email.com"
          required
          autoFocus
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full bg-white text-gray-900 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Envoi…' : 'Recevoir le code'}
        </button>
      </form>
    </>
  );
}
