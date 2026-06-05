import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client, License, LicenseType, LicenseStatus, Project } from '../../lib/queries';
import { LicenseModal } from './LicenseModal';
import { Modal } from './Modal';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { api } from '../../lib/api';

interface Props {
  client: Client;
  license: License | null;
  projects: Project[];
  companySlug: string;
  onDelete: (client: Client) => void;
}

function initials(firstName: string, lastName: string) {
  return (firstName[0] ?? '').toUpperCase() + (lastName[0] ?? '').toUpperCase();
}

const TYPE_BADGE: Record<LicenseType, { label: string; className: string }> = {
  FREE:    { label: 'Free',    className: 'bg-green-900/40 text-green-300 border-green-800' },
  CLASSIC: { label: 'Classic', className: 'bg-blue-900/40 text-blue-300 border-blue-800' },
  ADMIN:   { label: 'Admin',   className: 'bg-red-900/40 text-red-300 border-red-800' },
};

const STATUS_COLOR: Record<LicenseStatus, string> = {
  ACTIVE:    'text-green-400',
  EXPIRED:   'text-red-400',
  CANCELLED: 'text-gray-500',
};

const STATUS_DOT: Record<LicenseStatus, string> = {
  ACTIVE:    'bg-green-400',
  EXPIRED:   'bg-red-400',
  CANCELLED: 'bg-gray-500',
};

const STATUS_LABEL: Record<LicenseStatus, string> = {
  ACTIVE:    'Actif',
  EXPIRED:   'Expiré',
  CANCELLED: 'Annulé',
};

function expiryDate(license: License): string | null {
  if (license.type === 'ADMIN') return null;
  const raw = license.type === 'CLASSIC' ? license.currentPeriodEnd : license.validUntil;
  if (!raw) return null;
  return new Date(raw).toLocaleDateString('fr-FR');
}

// ─── Panel 0 : vue générale ───────────────────────────────────────────────────
function PanelOverview({ license }: { license: License | null }) {
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
        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Statut</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_COLOR[license.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[license.status]}`} />
          {STATUS_LABEL[license.status]}
        </span>
      </div>
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
      {license.type === 'CLASSIC' && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Prix</span>
          <span className={`text-xs font-semibold ${license.priceLabel ? 'text-white' : 'text-gray-600'}`}>
            {license.priceLabel ?? '—'}
          </span>
        </div>
      )}
      {license.machineLock && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Machines</span>
          <span className="text-xs text-gray-300">
            🔒 {license.machines.length} / {license.maxMachines}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Panel 1 : projets ────────────────────────────────────────────────────────
function PanelProjects({ license, projects }: { license: License | null; projects: Project[] }) {
  if (!license) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-600">
        Aucune licence
      </div>
    );
  }
  if (license.type === 'ADMIN') {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-gray-500 mb-1">Projets autorisés</p>
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <span className="text-green-400 text-xs">✓</span>
            <span className="text-xs text-gray-300">{p.name}</span>
            <span className="ml-auto text-xs text-gray-600">admin</span>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-xs text-gray-600">Aucun projet dans cette entreprise</p>
        )}
      </div>
    );
  }
  const grantedIds = new Set(license.projectAccess.map((a) => a.projectId));
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gray-500 mb-1">Projets autorisés</p>
      {projects.length === 0 && (
        <p className="text-xs text-gray-600">Aucun projet dans cette entreprise</p>
      )}
      {projects.map((p) => {
        const granted = grantedIds.has(p.id);
        return (
          <div key={p.id} className="flex items-center gap-2">
            <span className={`text-xs ${granted ? 'text-green-400' : 'text-gray-700'}`}>
              {granted ? '✓' : '✗'}
            </span>
            <span className={`text-xs ${granted ? 'text-gray-300' : 'text-gray-600'}`}>
              {p.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Panel 2 : machines ───────────────────────────────────────────────────────
function PanelMachines({ license }: { license: License | null }) {
  if (!license) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-600">
        Aucune licence
      </div>
    );
  }
  if (!license.machineLock) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-600">
        <span className="text-lg">🌐</span>
        <span className="text-xs">Accès libre — aucun verrouillage machine</span>
      </div>
    );
  }
  const machines = license.machines;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gray-500 mb-1">
        Machines ({machines.length} / {license.maxMachines})
      </p>
      {machines.length === 0 && (
        <p className="text-xs text-gray-600">Aucune machine enregistrée</p>
      )}
      {machines.map((m) => (
        <div key={m.id} className="bg-gray-800/60 rounded px-2 py-1.5">
          <p className="text-xs font-mono text-gray-300 truncate">{m.machineId}</p>
          <p className="text-xs text-gray-600 truncate">
            {m.label ? `"${m.label}"` : ''}
            {m.lastSeenAt
              ? ` · vu ${new Date(m.lastSeenAt).toLocaleDateString('fr-FR')}`
              : ' · jamais vu'}
          </p>
        </div>
      ))}
    </div>
  );
}

const PANELS = ['Général', 'Projets', 'Machines'] as const;

// ─── UserCard ─────────────────────────────────────────────────────────────────
export function UserCard({ client, license, projects, companySlug, onDelete }: Props) {
  const qc = useQueryClient();
  const [panel, setPanel] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [firstNameDraft, setFirstNameDraft] = useState(client.firstName);
  const [lastNameDraft, setLastNameDraft] = useState(client.lastName);
  const [copied, setCopied] = useState(false);

  const updateClient = useMutation({
    mutationFn: () => api.patch(`/clients/${client.id}`, { firstName: firstNameDraft.trim(), lastName: lastNameDraft.trim() }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      setEditModalOpen(false);
    },
  });

  function openEditModal() {
    setFirstNameDraft(client.firstName);
    setLastNameDraft(client.lastName);
    setEditModalOpen(true);
  }

  function copyEmail() {
    void navigator.clipboard.writeText(client.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const prev = () => setPanel((p) => (p - 1 + PANELS.length) % PANELS.length);
  const next = () => setPanel((p) => (p + 1) % PANELS.length);

  return (
    <>
      <div className="group relative flex flex-col bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-md w-full h-72">

        {/* Delete */}
        <button
          onClick={() => onDelete(client)}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-indigo-900/40 border-b border-indigo-800/40 px-3 py-3 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials(client.firstName, client.lastName)}
          </div>
          <div className="min-w-0 flex-1">
            <button
              onClick={openEditModal}
              className="group/name flex items-center gap-1.5 cursor-pointer text-left"
              title="Modifier"
            >
              <p className="text-white font-semibold text-sm truncate leading-tight group-hover/name:text-indigo-300 transition-colors">{client.firstName} {client.lastName}</p>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0 text-gray-600 group-hover/name:text-indigo-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <div className="flex items-center gap-1 group/email">
              <button
                onClick={copyEmail}
                className="text-indigo-300 text-xs truncate hover:text-indigo-100 transition-colors cursor-pointer text-left"
              >
                {client.email}
              </button>
              <button
                onClick={copyEmail}
                className="shrink-0 opacity-0 group-hover/email:opacity-100 transition-opacity cursor-pointer text-indigo-400 hover:text-white"
                title="Copier l'email"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Navigation */}
          <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
            <button
              onClick={prev}
              className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-xs px-1"
            >
              ‹
            </button>
            <div className="flex gap-1">
              {PANELS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPanel(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                    i === panel ? 'bg-indigo-400' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-xs px-1"
            >
              ›
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 px-3 pt-2 pb-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {panel === 0 && <PanelOverview license={license} />}
            {panel === 1 && <PanelProjects license={license} projects={projects} />}
            {panel === 2 && <PanelMachines license={license} />}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 px-3 py-2 flex gap-2 shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 text-center text-xs py-1.5 rounded-md border border-gray-700 text-gray-300 hover:border-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {license ? 'Gérer' : '+ Licence'}
          </button>
          <button
            onClick={() => window.open(window.location.href, '_blank')}
            className="flex-1 text-xs py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors cursor-pointer"
          >
            See as
          </button>
        </div>
      </div>

      {editModalOpen && (
        <Modal title={`Modifier — ${client.firstName} ${client.lastName}`} onClose={() => setEditModalOpen(false)}>
          <form
            onSubmit={(e) => { e.preventDefault(); updateClient.mutate(); }}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-3">
              <Input
                label="Prénom"
                value={firstNameDraft}
                onChange={(e) => setFirstNameDraft(e.target.value)}
                placeholder="Prénom"
                autoFocus
              />
              <Input
                label="Nom"
                value={lastNameDraft}
                onChange={(e) => setLastNameDraft(e.target.value)}
                placeholder="Nom"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={!firstNameDraft.trim() || !lastNameDraft.trim() || updateClient.isPending}>
                Enregistrer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {modalOpen && (
        <LicenseModal
          client={client}
          license={license}
          projects={projects}
          companySlug={companySlug}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
