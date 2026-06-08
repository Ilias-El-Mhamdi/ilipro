import type { User, License, Project } from '../../lib/queries';
import { Modal } from '../ui/Modal';
import { useLicenseForm } from './useLicenseForm';
import { LicenseTypeSelector } from './selectors/LicenseTypeSelector';
import { LicenseStatusSelector } from './selectors/LicenseStatusSelector';
import { LicenseProjectSelector } from './selectors/LicenseProjectSelector';
import { LicenseFreeFields } from './typeFields/LicenseFreeFields';
import { LicenseClassicFields } from './typeFields/LicenseClassicFields';
import { MachineLockSection } from './machineLock/MachineLockSection';
import { LicenseSimulate } from './actions/LicenseSimulate';
import { LicenseActions } from './actions/LicenseActions';

interface Props {
  user: User;
  license: License | null;
  projects: Project[];
  companySlug: string;
  companyId: string;
  onClose: () => void;
}

export function LicenseModal({ user, license, projects, companySlug, companyId, onClose }: Props) {
  const form = useLicenseForm({ user, license, companySlug, companyId, onClose });

  return (
    <Modal title={`Licence — ${user.firstName} ${user.lastName}`} onClose={onClose}>
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
          user={user}
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
