import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useClientBySlug, useProjectDeliverables } from '../../lib/queries';
import { api } from '../../lib/api';
import type { Project, Deliverable, LicenseType, LicenseStatus, License, ClientDetail, ClientCompanySection } from '../../lib/queries';
import { AdminLayout } from '../../components/templates/AdminLayout';

// ─── helpers ─────────────────────────────────────────────────────────────────

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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

async function downloadFile(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

// ─── License card panels ──────────────────────────────────────────────────────

function PanelOverview({ license }: { license: License }) {
  const badge = TYPE_BADGE[license.type];
  const expiry = expiryDate(license);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Licence</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${badge.className}`}>{badge.label}</span>
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
      {license.type === 'CLASSIC' && license.priceLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Prix</span>
          <span className="text-xs font-semibold text-white">{license.priceLabel}</span>
        </div>
      )}
      {license.machineLock && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Machines</span>
          <span className="text-xs text-gray-300">🔒 {license.machines.length} / {license.maxMachines}</span>
        </div>
      )}
    </div>
  );
}

function PanelProjects({ license, projects }: { license: License; projects: Project[] }) {
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
        {projects.length === 0 && <p className="text-xs text-gray-600">Aucun projet</p>}
      </div>
    );
  }
  const grantedIds = new Set(license.projectAccess.map((a) => a.projectId));
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gray-500 mb-1">Projets autorisés</p>
      {projects.length === 0 && <p className="text-xs text-gray-600">Aucun projet</p>}
      {projects.map((p) => {
        const granted = grantedIds.has(p.id);
        return (
          <div key={p.id} className="flex items-center gap-2">
            <span className={`text-xs ${granted ? 'text-green-400' : 'text-gray-700'}`}>{granted ? '✓' : '✗'}</span>
            <span className={`text-xs ${granted ? 'text-gray-300' : 'text-gray-600'}`}>{p.name}</span>
          </div>
        );
      })}
    </div>
  );
}

function PanelMachines({ license }: { license: License }) {
  if (!license.machineLock) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-600">
        <span className="text-lg">🌐</span>
        <span className="text-xs">Accès libre — aucun verrouillage machine</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gray-500 mb-1">Machines ({license.machines.length} / {license.maxMachines})</p>
      {license.machines.length === 0 && <p className="text-xs text-gray-600">Aucune machine enregistrée</p>}
      {license.machines.map((m) => (
        <div key={m.id} className="bg-gray-800/60 rounded px-2 py-1.5">
          <p className="text-xs font-mono text-gray-300 truncate">{m.machineId}</p>
          <p className="text-xs text-gray-600 truncate">
            {m.label ? `"${m.label}"` : ''}
            {m.lastSeenAt ? ` · vu ${new Date(m.lastSeenAt).toLocaleDateString('fr-FR')}` : ' · jamais vu'}
          </p>
        </div>
      ))}
    </div>
  );
}

const PANELS = ['Général', 'Projets', 'Machines'] as const;

// ─── License card ─────────────────────────────────────────────────────────────

function LicenseCard({ license, projects, client }: {
  license: License | null;
  projects: Project[];
  client: ClientDetail;
}) {
  const [panel, setPanel] = useState(0);
  const prev = () => setPanel((p) => (p - 1 + PANELS.length) % PANELS.length);
  const next = () => setPanel((p) => (p + 1) % PANELS.length);

  const billingPortal = useMutation({
    mutationFn: () =>
      api.post('/stripe/billing-portal', { clientId: client.id }).then((r) => r.data as { url: string }),
    onSuccess: ({ url }) => window.open(url, '_blank'),
  });

  const initials = (client.firstName[0] ?? '').toUpperCase() + (client.lastName[0] ?? '').toUpperCase();

  return (
    <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-md w-56">
      {/* Header */}
      <div className="bg-indigo-900/40 border-b border-indigo-800/40 px-3 py-3 flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-sm truncate leading-tight">{client.firstName} {client.lastName}</p>
          <p className="text-indigo-300 text-xs truncate">{client.email}</p>
        </div>
      </div>

      {!license ? (
        <div className="flex flex-col items-center justify-center py-8 gap-1 text-gray-600">
          <span className="text-2xl">—</span>
          <span className="text-xs">Aucune licence</span>
        </div>
      ) : (
        <>
          {/* Carousel */}
          <div className="h-44 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3 pt-3 pb-1 shrink-0">
          <button onClick={prev} className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-xs px-1">‹</button>
          <div className="flex gap-1">
            {PANELS.map((_, i) => (
              <button
                key={i}
                onClick={() => setPanel(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${i === panel ? 'bg-indigo-400' : 'bg-gray-700'}`}
              />
            ))}
          </div>
          <button onClick={next} className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-xs px-1">›</button>
            </div>
                <div className="flex-1 px-3 pt-2 pb-3 overflow-y-auto">
              {panel === 0 && <PanelOverview license={license} />}
              {panel === 1 && <PanelProjects license={license} projects={projects} />}
              {panel === 2 && <PanelMachines license={license} />}
            </div>
          </div>

          {/* Footer */}
          {client.stripeCustomerId && (
            <div className="border-t border-gray-800 px-3 py-2 shrink-0">
              <button
                onClick={() => billingPortal.mutate()}
                disabled={billingPortal.isPending}
                className="w-full text-xs py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                See billing
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Deliverable row ──────────────────────────────────────────────────────────

function DeliverableRow({ deliverable }: { deliverable: Deliverable }) {
  return (
    <button
      onClick={() => void downloadFile(deliverable.url, deliverable.name)}
      className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17a3 3 0 003 3h12a3 3 0 003-3v-1" />
      </svg>
      <span className="text-sm text-gray-300 group-hover:text-white truncate flex-1">{deliverable.name}</span>
      <span className="text-xs text-gray-600 shrink-0">{formatSize(deliverable.size)}</span>
    </button>
  );
}

// ─── Project row ──────────────────────────────────────────────────────────────

function ProjectRow({ project, client, license }: { project: Project; client: ClientDetail; license: License | null }) {
  const { data: deliverables = [] } = useProjectDeliverables(project.id);

  const hasAccess = !license
    ? false
    : license.type === 'ADMIN'
    ? true
    : license.projectAccess.some((a) => a.projectId === project.id);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
        <h3 className="text-white font-semibold">{project.name}</h3>
        <div className="flex gap-1.5">
          {project.appUrl && (
            <a href={project.appUrl} target="_blank" rel="noreferrer"
              className="text-xs bg-indigo-900/30 text-indigo-300 border border-indigo-800/40 rounded px-2 py-0.5 hover:bg-indigo-800/50 transition-colors">
              App
            </a>
          )}
          {project.docsUrl && (
            <a href={project.docsUrl} target="_blank" rel="noreferrer"
              className="text-xs bg-gray-800 text-gray-300 border border-gray-700 rounded px-2 py-0.5 hover:bg-gray-700 transition-colors">
              Doc
            </a>
          )}
          {project.changelogUrl && (
            <a href={project.changelogUrl} target="_blank" rel="noreferrer"
              className="text-xs bg-orange-900/30 text-orange-300 border border-orange-800/40 rounded px-2 py-0.5 hover:bg-orange-800/50 transition-colors">
              Changelog
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-gray-800">
        <div className="px-4 py-3">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Accès</p>
          {hasAccess ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(client.firstName[0] ?? '').toUpperCase()}{(client.lastName[0] ?? '').toUpperCase()}
              </div>
              <span className="text-xs text-gray-300 truncate flex-1">{client.firstName} {client.lastName}</span>
              {license && (
                <span className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded border ${TYPE_BADGE[license.type].className}`}>
                  {TYPE_BADGE[license.type].label}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                {(client.firstName[0] ?? '').toUpperCase()}{(client.lastName[0] ?? '').toUpperCase()}
              </div>
              <span className="text-xs text-gray-600 truncate flex-1">{client.firstName} {client.lastName}</span>
              <span className="shrink-0 text-xs text-red-400 border border-red-900/50 bg-red-900/20 rounded px-1.5 py-0.5">
                Non autorisé
              </span>
            </div>
          )}
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Livrables</p>
          {deliverables.length === 0 ? (
            <p className="text-gray-600 text-xs">Aucun livrable</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {deliverables.map((d) => (
                <DeliverableRow key={d.id} deliverable={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Company section ──────────────────────────────────────────────────────────

function CompanySection({ section, client }: { section: ClientCompanySection; client: ClientDetail }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-800">
        <Link
          to={`/admin/companies/${section.slug}`}
          className="text-lg font-semibold text-white hover:text-indigo-300 transition-colors"
        >
          {section.name}
        </Link>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </div>

      <div className="mb-6">
        <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Licence</h3>
        <LicenseCard
          license={section.license}
          projects={section.projects}
          client={client}
        />
      </div>

      <div>
        <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Projets</h3>
        {section.projects.length === 0 ? (
          <p className="text-gray-600 text-sm">Aucun projet dans cette entreprise.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {section.projects.map((project) => (
              <ProjectRow key={project.id} project={project} client={client} license={section.license} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── UserDetailPage ───────────────────────────────────────────────────────────

export function UserDetailPage() {
  const { userSlug } = useParams<{ userSlug: string }>();
  const { data: client, isLoading } = useClientBySlug(userSlug!);
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    if (!client) return;
    void navigator.clipboard.writeText(client.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (isLoading) {
    return <AdminLayout><p className="text-gray-500">Chargement...</p></AdminLayout>;
  }

  if (!client) {
    return <AdminLayout><p className="text-gray-500">Utilisateur introuvable.</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-2">
        <Link to="/admin/users" className="text-gray-500 hover:text-gray-300 text-sm">
          ← Utilisateurs
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">{client.firstName} {client.lastName}</h1>
        <div className="flex items-center gap-2 group/email">
          <button
            onClick={copyEmail}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer"
          >
            {client.email}
          </button>
          <button
            onClick={copyEmail}
            className="opacity-0 group-hover/email:opacity-100 transition-opacity cursor-pointer text-gray-600 hover:text-gray-300"
            title="Copier l'email"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {client.companies.length === 0 ? (
        <p className="text-gray-600 text-sm">Cet utilisateur n'appartient à aucune entreprise.</p>
      ) : (
        client.companies.map((section) => (
          <CompanySection key={section.id} section={section} client={client} />
        ))
      )}
    </AdminLayout>
  );
}
