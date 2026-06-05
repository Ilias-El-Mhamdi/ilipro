import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client, License, LicenseType, LicenseStatus, Project } from '../../lib/queries';
import { Modal } from './Modal';
import { Button } from '../atoms/Button';
import { api } from '../../lib/api';

interface Props {
  client: Client;
  license: License | null;
  projects: Project[];
  companySlug: string;
  companyId: string;
  onClose: () => void;
}

const TYPE_LABELS: Record<LicenseType, string> = {
  FREE: 'Free',
  CLASSIC: 'Classic',
  ADMIN: 'Admin',
};

const STATUS_LABELS: Record<LicenseStatus, string> = {
  ACTIVE: 'Actif',
  EXPIRED: 'Expiré',
  CANCELLED: 'Annulé',
};

export function LicenseModal({ client, license, projects, companySlug, companyId, onClose }: Props) {
  const qc = useQueryClient();

  const [type, setType] = useState<LicenseType>(license?.type ?? 'FREE');
  const [status, setStatus] = useState<LicenseStatus>(license?.status ?? 'ACTIVE');
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
    void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
    void qc.invalidateQueries({ queryKey: ['clients', client.id, 'license'] });
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
      if (license) {
        return api.patch(`/licenses/${license.id}`, payload);
      }
      return api.post('/licenses', { ...payload, clientId: client.id, companyId });
    },
    onSuccess: () => {
      invalidate();
      onClose();
    },
  });

  const revokeMutation = useMutation({
    mutationFn: () => api.delete(`/licenses/${license!.id}`),
    onSuccess: () => {
      invalidate();
      onClose();
    },
  });

  const removeMachineMutation = useMutation({
    mutationFn: (machineId: string) =>
      api.delete(`/licenses/${license!.id}/machines/${machineId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clients', client.id, 'license'] });
    },
  });

  const billingPortalMutation = useMutation({
    mutationFn: () =>
      api.post('/stripe/billing-portal', { clientId: client.id }).then((r) => r.data as { url: string }),
    onSuccess: ({ url }) => window.open(url, '_blank'),
  });

  const simulateMutation = useMutation({
    mutationFn: () =>
      api.post('/stripe/dev/simulate', {
        email: client.email,
        name: `${client.firstName} ${client.lastName}`,
        companyId,
      }),
    onSuccess: () => {
      invalidate();
      onClose();
    },
  });

  function toggleProject(id: string) {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  const machines = license?.machines ?? [];

  return (
    <Modal title={`Licence — ${client.firstName} ${client.lastName}`} onClose={onClose}>
      <div className="flex flex-col gap-5">

        {/* Type */}
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Type de licence</p>
          <div className="flex gap-2">
            {(['FREE', 'CLASSIC', 'ADMIN'] as LicenseType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 text-xs py-2 rounded-md border transition-colors cursor-pointer ${
                  type === t
                    ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Statut</p>
          <div className="flex gap-2">
            {(['ACTIVE', 'EXPIRED', 'CANCELLED'] as LicenseStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex-1 text-xs py-2 rounded-md border transition-colors cursor-pointer ${
                  status === s
                    ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Projects */}
        {type !== 'ADMIN' && (
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Projets autorisés</p>
            <div className="flex flex-col gap-1">
              {projects.map((p) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedProjectIds.includes(p.id)}
                    onChange={() => toggleProject(p.id)}
                    className="accent-indigo-500"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {p.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        {type === 'ADMIN' && (
          <p className="text-xs text-gray-500 italic">Accès total — tous les projets, sans expiration.</p>
        )}

        {/* Free trial date */}
        {type === 'FREE' && (
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Valide jusqu'au</p>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* CLASSIC — prix */}
        {type === 'CLASSIC' && (
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Prix</p>
            <input
              type="text"
              value={priceLabel}
              onChange={(e) => setPriceLabel(e.target.value)}
              placeholder="ex: 49€/mois, 499€/an…"
              className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-indigo-500 placeholder:text-gray-600"
            />
          </div>
        )}

        {/* CLASSIC Stripe info */}
        {type === 'CLASSIC' && license?.stripeSubscriptionId && (
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

        {/* Machine lock */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Machine Lock</p>
            <button
              onClick={() => setMachineLock((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                machineLock ? 'bg-indigo-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                  machineLock ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {machineLock && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">PCs autorisés</p>
              <input
                type="number"
                min={1}
                value={maxMachines}
                onChange={(e) => setMaxMachines(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white w-24 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {machines.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Machines enregistrées ({machines.length}/{machineLock ? maxMachines : '∞'})</p>
              <div className="flex flex-col gap-1">
                {machines.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded px-3 py-2">
                    <div>
                      <span className="text-xs font-mono text-gray-300">{m.machineId}</span>
                      {m.label && <span className="ml-2 text-xs text-gray-500">"{m.label}"</span>}
                      {m.lastSeenAt && (
                        <span className="ml-2 text-xs text-gray-600">
                          · vu {new Date(m.lastSeenAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeMachineMutation.mutate(m.machineId)}
                      className="text-gray-600 hover:text-red-400 text-xs transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Simulate (dev) */}
        <div className="border border-dashed border-gray-700 rounded-md px-3 py-2">
          <p className="text-xs text-gray-500 mb-2">
            ⚡ Dev — Simuler un paiement Stripe (crée une licence CLASSIC)
          </p>
          <Button
            variant="ghost"
            onClick={() => simulateMutation.mutate()}
            disabled={simulateMutation.isPending}
            className="text-xs w-full"
          >
            {simulateMutation.isPending ? 'Simulation...' : 'Simuler souscription Stripe'}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
          <div className="flex gap-2">
            {license && (
              <>
                <Button
                  variant="danger"
                  onClick={() => revokeMutation.mutate()}
                  disabled={revokeMutation.isPending}
                >
                  Révoquer
                </Button>
                {client.stripeCustomerId && (
                  <Button
                    variant="ghost"
                    onClick={() => billingPortalMutation.mutate()}
                    disabled={billingPortalMutation.isPending}
                  >
                    Stripe billing
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Annuler</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {license ? 'Sauvegarder' : 'Créer'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
