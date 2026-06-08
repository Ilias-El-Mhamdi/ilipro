interface Props {
  validUntil: string;
  onChange: (v: string) => void;
}

export function LicenseFreeFields({ validUntil, onChange }: Props) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Valide jusqu'au</p>
      <input
        type="date"
        value={validUntil}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}
