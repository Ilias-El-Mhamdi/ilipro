import type { LicenseType } from '../../lib/queries';
import { TYPE_BADGE } from '../../lib/licenseConstants';

interface Props {
  type: LicenseType;
  className?: string;
}

export function LicenseBadge({ type, className = '' }: Props) {
  const badge = TYPE_BADGE[type];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${badge.className} ${className}`}>
      {badge.label}
    </span>
  );
}
