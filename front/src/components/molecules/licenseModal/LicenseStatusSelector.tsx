import type { LicenseStatus } from '../../../lib/queries';
import { STATUS_LABEL } from '../../../lib/licenseConstants';

interface Props {
  value: LicenseStatus;
  onChange: (s: LicenseStatus) => void;
}

export function LicenseStatusSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Statut</p>
      <div className="flex gap-2">
        {(['ACTIVE', 'EXPIRED', 'CANCELLED'] as LicenseStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`flex-1 text-xs py-2 rounded-md border transition-colors cursor-pointer ${
              value === s
                ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
