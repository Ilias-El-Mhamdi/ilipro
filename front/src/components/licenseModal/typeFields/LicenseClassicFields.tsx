import type { License } from '../../../lib/queries';

interface Props {
  priceLabel: string;
  onPriceLabelChange: (v: string) => void;
  license: License | null;
}

export function LicenseClassicFields({ priceLabel, onPriceLabelChange, license }: Props) {
  return (
    <>
      <div>
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Prix</p>
        <input
          type="text"
          value={priceLabel}
          onChange={(e) => onPriceLabelChange(e.target.value)}
          placeholder="ex: 49€/mois, 499€/an…"
          className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-indigo-500 placeholder:text-gray-600"
        />
      </div>
      {license?.stripeSubscriptionId && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-400">
          <span className="text-gray-500">Subscription Stripe : </span>
          <span className="font-mono text-gray-300">{license.stripeSubscriptionId}</span>
          {license.currentPeriodEnd && (
            <span className="ml-2 text-gray-500">
              · Expire le {new Date(license.currentPeriodEnd).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      )}
    </>
  );
}
