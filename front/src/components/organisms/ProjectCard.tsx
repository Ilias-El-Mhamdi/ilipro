import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProjectClients, useProjectDeliverables } from '../../lib/queries';
import type { Project, Client, Deliverable } from '../../lib/queries';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Modal } from '../molecules/Modal';
import { ConfirmDialog } from '../molecules/ConfirmDialog';
import { FileDropZone } from '../molecules/FileDropZone';
import { UserCard } from '../molecules/UserCard';
import { api } from '../../lib/api';

interface Props {
  project: Project;
  companySlug: string;
  onDeleteProject: (project: Project) => void;
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

export function ProjectCard({ project, companySlug, onDeleteProject }: Props) {
  const qc = useQueryClient();
  const { data: clients = [] } = useProjectClients(project.id);
  const { data: deliverables = [] } = useProjectDeliverables(project.id);

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [confirmClient, setConfirmClient] = useState<Client | null>(null);
  const [confirmDeliverable, setConfirmDeliverable] = useState<Deliverable | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const addClient = useMutation({
    mutationFn: () => api.post(`/projects/${project.id}/clients`, { name, email }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', project.id, 'clients'] });
      void qc.invalidateQueries({ queryKey: ['clients'] });
      setClientModalOpen(false);
      setName('');
      setEmail('');
    },
  });

  const removeClient = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', project.id, 'clients'] });
      setConfirmClient(null);
    },
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
    },
  });

  const removeDeliverable = useMutation({
    mutationFn: (id: string) => api.delete(`/deliverables/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', project.id, 'deliverables'] });
      setConfirmDeliverable(null);
    },
  });

  function handleFiles(files: File[]) {
    files.forEach((file) => uploadDeliverable.mutate(file));
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
          <button
            onClick={() => {}}
            className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Doc
          </button>
          <button
            onClick={() => {}}
            className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Changelog
          </button>
        </div>
        <Button variant="danger" onClick={() => onDeleteProject(project)}>Supprimer</Button>
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 divide-x divide-gray-800">
        {/* Clients */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Utilisateurs</span>
            <button
              onClick={() => setClientModalOpen(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              + Ajouter
            </button>
          </div>
          {clients.length === 0 ? (
            <p className="text-gray-600 text-sm">Aucun utilisateur</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {clients.map((c, i) => (
                <div key={c.id} className={i === clients.length - 1 && clients.length % 2 !== 0 ? 'col-span-2' : ''}>
                  <UserCard user={c} onDelete={setConfirmClient} />
                </div>
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

      {/* Modal client */}
      {clientModalOpen && (
        <Modal title="Nouvel utilisateur" onClose={() => setClientModalOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); addClient.mutate(); }} className="flex flex-col gap-4">
            <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de l'utilisateur" autoFocus />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setClientModalOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={!name.trim() || !email.trim()}>Ajouter</Button>
            </div>
          </form>
        </Modal>
      )}

      {confirmClient && (
        <ConfirmDialog
          message={`Supprimer l'utilisateur « ${confirmClient.name} » ?`}
          onConfirm={() => removeClient.mutate(confirmClient.id)}
          onCancel={() => setConfirmClient(null)}
        />
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
