import { Button } from '../../atoms/Button';

interface Props {
  onSimulate: () => void;
  isPending: boolean;
}

export function LicenseSimulate({ onSimulate, isPending }: Props) {
  return (
    <div className="border border-dashed border-gray-700 rounded-md px-3 py-2">
      <p className="text-xs text-gray-500 mb-2">⚡ Dev — Simuler un paiement Stripe (crée une licence CLASSIC)</p>
      <Button variant="ghost" onClick={onSimulate} disabled={isPending} className="text-xs w-full">
        {isPending ? 'Simulation...' : 'Simuler souscription Stripe'}
      </Button>
    </div>
  );
}
