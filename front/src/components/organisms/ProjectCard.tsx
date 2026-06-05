import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProjectDeliverables } from '../../lib/queries';
import type { Project, Client, Deliverable, LicenseType } from '../../lib/queries';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Modal } from '../molecules/Modal';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { FileDropZone } from '../molecules/FileDropZone';
import { api } from '../../lib/api';

interface Props {
  project: Project;
  companySlug: string;
  clients: Client[];
  onDeleteProject: (project: Project) => void;
}

const LICENSE_BADGE: Record<LicenseType, string> = {
  FREE:    'bg-green-900/40 text-green-300 border border-green-800',
  CLASSIC: 'bg-blue-900/40 text-blue-300 border border-blue-800',
  ADMIN:   'bg-red-900/40 text-red-300 border border-red-800',
};

function LicenseBadge({ type }: { type: LicenseType }) {
  return (
    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded ${LICENSE_BADGE[type]}`}>
      {type}
    </span>
  );
}

function scrollAndHighlight(clientId: string) {
  const el = document.getElementById(`user-${clientId}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.style.transition = 'box-shadow 0.2s ease';
  el.style.boxShadow = '0 0 0 2px #818cf8, 0 0 16px 2px #818cf840';
  setTimeout(() => {
    el.style.boxShadow = '';
  }, 1500);
}

async function downloadFile(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

function initials(firstName: string, lastName: string) {
  return (firstName[0] ?? '').toUpperCase() + (lastName[0] ?? '').toUpperCase();
}

const LINK_BUTTON_STYLE = {
  app:       'border-green-800 text-green-400 hover:border-green-600 hover:text-green-300',
  doc:       'border-blue-800 text-blue-400 hover:border-blue-600 hover:text-blue-300',
  changelog: 'border-red-800 text-red-400 hover:border-red-600 hover:text-red-300',
} as const;

function LinkButton({ href, label, variant }: { href: string; label: string; variant: keyof typeof LINK_BUTTON_STYLE }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-xs px-2 py-1 rounded border transition-colors ${LINK_BUTTON_STYLE[variant]}`}
    >
      {label}
    </a>
  );
}

export function ProjectCard({ project, companySlug, clients, onDeleteProject }: Props) {
  const qc = useQueryClient();
  const { data: deliverables = [] } = useProjectDeliverables(project.id);
  const [idCopied, setIdCopied] = useState(false);

  function copyProjectId() {
    void navigator.clipboard.writeText(project.id).then(() => {
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 1500);
    });
  }

  const [confirmDeliverable, setConfirmDeliverable] = useState<Deliverable | null>(null);
  const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(project.name);
  const [appUrl, setAppUrl] = useState(project.appUrl ?? '');
  const [docsUrl, setDocsUrl] = useState(project.docsUrl ?? '');
  const [changelogUrl, setChangelogUrl] = useState(project.changelogUrl ?? '');

  const accessClients = clients.filter((c) => {
    const license = c.license;
    if (!license || license.status !== 'ACTIVE') return false;
    if (license.type === 'ADMIN') return true;
    return license.projectAccess.some((a) => a.projectId === project.id);
  });

  const uploadDeliverable = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post(`/projects/${project.id}/deliverables`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', project.id, 'deliverables'] });
      setDeliverableModalOpen(false);
    },
  });

  const removeDeliverable = useMutation({
    mutationFn: (id: string) => api.delete(`/deliverables/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', project.id, 'deliverables'] });
      setConfirmDeliverable(null);
    },
  });

  const updateProject = useMutation({
    mutationFn: () =>
      api.patch(`/projects/${project.id}`, {
        name: nameDraft.trim() || project.name,
        appUrl: appUrl || null,
        docsUrl: docsUrl || null,
        changelogUrl: changelogUrl || null,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'projects'] });
      void qc.invalidateQueries({ queryKey: ['projects'] });
      setEditModalOpen(false);
    },
  });

  function handleFiles(files: File[]) {
    files.forEach((file) => uploadDeliverable.mutate(file));
  }

  function openEditModal() {
    setNameDraft(project.name);
    setAppUrl(project.appUrl ?? '');
    setDocsUrl(project.docsUrl ?? '');
    setChangelogUrl(project.changelogUrl ?? '');
    setEditModalOpen(true);
  }

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/60 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/companies/${companySlug}/projects/${project.slug}`}
            className="font-semibold text-white hover:text-indigo-400 transition-colors"
          >
            {project.name}
          </Link>
          {project.appUrl && <LinkButton href={project.appUrl} label="App" variant="app" />}
          {project.docsUrl && <LinkButton href={project.docsUrl} label="Doc" variant="doc" />}
          {project.changelogUrl && <LinkButton href={project.changelogUrl} label="Changelog" variant="changelog" />}
          <button
            onClick={copyProjectId}
            className="group/id flex items-center gap-1.5 cursor-pointer"
            title="Copier l'ID projet"
          >
            <span className="text-xs font-mono text-gray-600 group-hover/id:text-gray-400 transition-colors truncate max-w-[80px]">
              {project.id}
            </span>
            {idCopied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-700 group-hover/id:text-gray-400 transition-colors shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openEditModal}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:border-indigo-500 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Éditer
          </button>
          <Button variant="danger" onClick={() => onDeleteProject(project)}>Supprimer</Button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 divide-x divide-gray-800">
        {/* Accès (read-only) */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              Accès ({accessClients.length})
            </span>
          </div>
          {accessClients.length === 0 ? (
            <p className="text-gray-600 text-sm">Aucun client</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {accessClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => scrollAndHighlight(c.id)}
                  className="w-full flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-gray-800/60 transition-colors cursor-pointer text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials(c.firstName, c.lastName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-gray-300">{c.firstName} {c.lastName}</span>
                    <span className="text-xs text-gray-600 ml-1.5">{c.email}</span>
                  </div>
                  {c.license?.type && <LicenseBadge type={c.license.type} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Livrables */}
        <div className="p-4 flex flex-col gap-3">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Livrables</span>
          {deliverables.length > 0 && (
            <ul className="flex flex-col gap-1">
              {deliverables.map((d) => (
                <li key={d.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => downloadFile(d.url, d.name)}
                      className="text-sm text-white hover:text-indigo-400 truncate transition-colors text-left"
                    >
                      {d.name}
                    </button>
                    <span className="text-xs text-gray-600 shrink-0">{formatSize(d.size)}</span>
                  </div>
                  <button
                    onClick={() => setConfirmDeliverable(d)}
                    className="text-gray-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <FileDropZone onFiles={handleFiles} loading={uploadDeliverable.isPending} />
        </div>
      </div>

      {deliverableModalOpen && (
        <Modal title="Ajouter un livrable" onClose={() => setDeliverableModalOpen(false)}>
          <FileDropZone onFiles={handleFiles} loading={uploadDeliverable.isPending} />
        </Modal>
      )}

      {editModalOpen && (
        <Modal title={`Éditer — ${project.name}`} onClose={() => setEditModalOpen(false)}>
          <form
            onSubmit={(e) => { e.preventDefault(); updateProject.mutate(); }}
            className="flex flex-col gap-4"
          >
            <Input
              label="Nom"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Nom du projet"
              autoFocus
            />
            <Input
              label="URL App"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              placeholder="https://app.exemple.com"
            />
            <Input
              label="URL Documentation"
              value={docsUrl}
              onChange={(e) => setDocsUrl(e.target.value)}
              placeholder="https://docs.exemple.com"
            />
            <Input
              label="URL Changelog"
              value={changelogUrl}
              onChange={(e) => setChangelogUrl(e.target.value)}
              placeholder="https://changelog.exemple.com"
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={updateProject.isPending}>Enregistrer</Button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDeliverable && (
        <ConfirmDialog
          message={`Supprimer le livrable « ${confirmDeliverable.name} » ?`}
          onConfirm={() => removeDeliverable.mutate(confirmDeliverable.id)}
          onCancel={() => setConfirmDeliverable(null)}
        />
      )}
    </div>
  );
}
