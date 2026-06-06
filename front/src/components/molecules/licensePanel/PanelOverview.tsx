import type {License} from '../../../lib/queries';
import {expiryDate} from '../../../lib/utils';
import {TYPE_BADGE, STATUS_COLOR, STATUS_DOT, STATUS_LABEL} from '../../../lib/licenseConstants';

export function PanelOverview({license}: { license: License | null }) {
    if (!license) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-600">
                <span className="text-2xl">—</span>
                <span className="text-xs">Aucune licence</span>
            </div>
        );
    }
    const badge = TYPE_BADGE[license.type];
    const expiry = expiryDate(license);
    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Licence</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Statut</span>
                <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_COLOR[license.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[license.status]}`}/>
                    {STATUS_LABEL[license.status]}
        </span>
            </div>

            {/* expire le  */}
            {license.type === 'ADMIN' ? (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Expire le</span>
                    <span className="text-xs text-gray-500">Jamais</span>
                </div>
            ) : expiry ? (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Expire le</span>
                    <span className="text-xs text-gray-300">{expiry}</span>
                </div>
            ) : null}

            {/* prix  */}
            {license.type === 'CLASSIC' && (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Prix</span>
                    <span className={`text-xs font-semibold ${license.priceLabel ? 'text-white' : 'text-gray-600'}`}>
            {license.priceLabel ?? '—'}
          </span>
                </div>
            )}

            {/* machine  */}
            {license.machineLock && (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Machines</span>
                    <span className="text-xs text-gray-300">🔒 {license.machines.length} / {license.maxMachines}</span>
                </div>
            )}
        </div>
    );
}
