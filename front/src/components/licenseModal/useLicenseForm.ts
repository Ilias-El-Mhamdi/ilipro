import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  License,
  LicenseStatus,
  LicenseType,
} from 'platform/contracts/shared/license';
import type { User } from 'platform/contracts/shared/user';
import { api } from '../../lib/api';
import { toastSuccess, toastError } from '../../lib/toast';
import { CreateLicenseRequest } from 'platform/contracts/adminDashboard/licenses/createLicense/createLicense.request';
import { UpdateLicenseRequest } from 'platform/contracts/adminDashboard/licenses/updateLicense/updateLicense.request';
import { DeleteLicenseRequest } from 'platform/contracts/adminDashboard/licenses/deleteLicense/deleteLicense.request';
import { DeleteLicenseMachineRequest } from 'platform/contracts/adminDashboard/licenses/deleteLicenseMachine/deleteLicenseMachine.request';
import { BillingPortalRequest } from 'platform/contracts/payment/billingPortal/billingPortal.request';

interface Props {
  user: User;
  license: License | null;
  companySlug: string;
  companyId: string;
  onClose: () => void;
}

export function useLicenseForm({
  user,
  license,
  companySlug,
  companyId,
  onClose,
}: Props) {
  const qc = useQueryClient();

  const [type, setType] = useState<LicenseType>(license?.type ?? 'FREE');
  const [status, setStatus] = useState<LicenseStatus>(
    license?.status ?? 'ACTIVE',
  );
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    license?.projectAccess.map((p) => p.projectId) ?? [],
  );
  const [machineLock, setMachineLock] = useState(license?.machineLock ?? false);
  const [maxMachines, setMaxMachines] = useState(license?.maxMachines ?? 1);
  const [validUntil, setValidUntil] = useState(
    license?.validUntil ? license.validUntil.slice(0, 10) : '',
  );
  const [priceLabel, setPriceLabel] = useState(license?.priceLabel ?? '');

  function invalidate() {
    void qc.invalidateQueries({
      queryKey: ['companies', companySlug, 'users'],
    });
    void qc.invalidateQueries({ queryKey: ['users', user.id, 'license'] });
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        type,
        status,
        projectIds: type === 'ADMIN' ? [] : selectedProjectIds,
        machineLock,
        maxMachines,
        validUntil: type === 'FREE' && validUntil ? validUntil : null,
        priceLabel: type === 'CLASSIC' && priceLabel ? priceLabel : null,
      };
      if (license)
        return api.patch(UpdateLicenseRequest.buildUrl(license.id), payload);
      return api.post(CreateLicenseRequest.buildUrl(), {
        ...payload,
        userId: user.id,
        companyId,
      });
    },
    onSuccess: () => {
      invalidate();
      onClose();
      toastSuccess(license ? 'Licence mise à jour' : 'Licence créée');
    },
    onError: toastError,
  });

  const revokeMutation = useMutation({
    mutationFn: () => api.delete(DeleteLicenseRequest.buildUrl(license!.id)),
    onSuccess: () => {
      invalidate();
      onClose();
      toastSuccess('Licence révoquée');
    },
    onError: toastError,
  });

  const removeMachineMutation = useMutation({
    mutationFn: (machineId: string) =>
      api.delete(DeleteLicenseMachineRequest.buildUrl(license!.id, machineId)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', user.id, 'license'] });
      toastSuccess('Machine retirée');
    },
    onError: toastError,
  });

  const billingPortalMutation = useMutation({
    mutationFn: () =>
      api
        .post(BillingPortalRequest.buildUrl(), { userId: user.id })
        .then((r) => r.data as { url: string }),
    onSuccess: ({ url }) => window.open(url, '_blank'),
    onError: toastError,
  });

  const simulateMutation = useMutation({
    mutationFn: () =>
      api.post('/stripe/dev/simulate', {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        companyId,
      }),
    onSuccess: () => {
      invalidate();
      onClose();
      toastSuccess('Abonnement simulé');
    },
    onError: toastError,
  });

  function toggleProject(id: string) {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  return {
    type,
    setType,
    status,
    setStatus,
    selectedProjectIds,
    machineLock,
    setMachineLock,
    maxMachines,
    setMaxMachines,
    validUntil,
    setValidUntil,
    priceLabel,
    setPriceLabel,
    machines: license?.machines ?? [],
    toggleProject,
    saveMutation,
    revokeMutation,
    removeMachineMutation,
    billingPortalMutation,
    simulateMutation,
  };
}
