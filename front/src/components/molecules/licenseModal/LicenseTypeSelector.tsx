import type { LicenseType } from '../../../lib/queries';
import { TYPE_BADGE } from '../../../lib/licenseConstants';

interface Props {
  value: LicenseType;
  onChange: (t: LicenseType) => void;
}

export function LicenseTypeSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Type de licence</p>
      <div className="flex gap-2">
        {(['FREE', 'CLASSIC', 'ADMIN'] as LicenseType[]).map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`flex-1 text-xs py-2 rounded-md border transition-colors cursor-pointer ${
              value === t
                ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {TYPE_BADGE[t].label}
          </button>
        ))}
      </div>
    </div>
  );
}
