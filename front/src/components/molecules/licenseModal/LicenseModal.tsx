import type { Client, License, Project } from '../../../lib/queries';
import { Modal } from '../Modal';
import { useLicenseForm } from '../../../hooks/useLicenseForm';
import { LicenseTypeSelector } from './LicenseTypeSelector';
import { LicenseStatusSelector } from './LicenseStatusSelector';
import { LicenseProjectSelector } from './LicenseProjectSelector';
import { LicenseFreeFields } from './LicenseFreeFields';
import { LicenseClassicFields } from './LicenseClassicFields';
import { MachineLockSection } from './MachineLockSection';
import { LicenseSimulate } from './LicenseSimulate';
import { LicenseActions } from './LicenseActions';

interface Props {
  client: Client;
  license: License | null;
  projects: Project[];
  companySlug: string;
  companyId: string;
  onClose: () => void;
}

export function LicenseModal({ client, license, projects, companySlug, companyId, onClose }: Props) {
  const form = useLicenseForm({ client, license, companySlug, companyId, onClose });

  return (
    <Modal title={`Licence — ${client.firstName} ${client.lastName}`} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <LicenseTypeSelector value={form.type} onChange={form.setType} />
        <LicenseStatusSelector value={form.status} onChange={form.setStatus} />
        <LicenseProjectSelector type={form.type} projects={projects} selectedIds={form.selectedProjectIds} onToggle={form.toggleProject} />
        {form.type === 'FREE' && <LicenseFreeFields validUntil={form.validUntil} onChange={form.setValidUntil} />}
        {form.type === 'CLASSIC' && (
          <LicenseClassicFields priceLabel={form.priceLabel} onPriceLabelChange={form.setPriceLabel} license={license} />
        )}
        <MachineLockSection
          machineLock={form.machineLock}
          onToggle={() => form.setMachineLock((v) => !v)}
          maxMachines={form.maxMachines}
          onMaxMachinesChange={form.setMaxMachines}
          machines={form.machines}
          onRemoveMachine={form.removeMachineMutation.mutate}
          removePending={form.removeMachineMutation.isPending}
        />
        <LicenseSimulate onSimulate={form.simulateMutation.mutate} isPending={form.simulateMutation.isPending} />
        <LicenseActions
          license={license}
          client={client}
          onRevoke={form.revokeMutation.mutate}
          revokePending={form.revokeMutation.isPending}
          onBillingPortal={form.billingPortalMutation.mutate}
          billingPending={form.billingPortalMutation.isPending}
          onCancel={onClose}
          onSave={form.saveMutation.mutate}
          savePending={form.saveMutation.isPending}
        />
      </div>
    </Modal>
  );
}
