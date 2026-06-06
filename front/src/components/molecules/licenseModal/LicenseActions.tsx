import type { Client, License } from '../../../lib/queries';
import { Button } from '../../atoms/Button';

interface Props {
  license: License | null;
  client: Client;
  onRevoke: () => void;
  revokePending: boolean;
  onBillingPortal: () => void;
  billingPending: boolean;
  onCancel: () => void;
  onSave: () => void;
  savePending: boolean;
}

export function LicenseActions({ license, client, onRevoke, revokePending, onBillingPortal, billingPending, onCancel, onSave, savePending }: Props) {
  return (
    <div className="flex items-center justify-between border-t border-gray-800 pt-4">
      <div className="flex gap-2">
        {license && (
          <>
            <Button variant="danger" onClick={onRevoke} disabled={revokePending}>Révoquer</Button>
            {client.stripeCustomerId && (
              <Button variant="ghost" onClick={onBillingPortal} disabled={billingPending}>Stripe billing</Button>
            )}
          </>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button onClick={onSave} disabled={savePending}>
          {license ? 'Sauvegarder' : 'Créer'}
        </Button>
      </div>
    </div>
  );
}
