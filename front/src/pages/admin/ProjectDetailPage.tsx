import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCompanies, useCompanyProjects, useProjectClients, useProjectDeliverables } from '../../lib/queries';
import type { Client, Deliverable } from '../../lib/queries';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Modal } from '../../components/molecules/Modal';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';
import { FileDropZone } from '../../components/molecules/FileDropZone';
import { UserCard } from '../../components/molecules/UserCard';
import { api } from '../../lib/api';

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

export function ProjectDetailPage() {
  const { companySlug, projectSlug } = useParams<{ companySlug: string; projectSlug: string }>();
  const qc = useQueryClient();

  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useCompanyProjects(companySlug!);
  const company = companies.find((c) => c.slug === companySlug);
  const project = projects.find((p) => p.slug === projectSlug);

  const { data: clients = [] } = useProjectClients(project?.id ?? '');
  const { data: deliverables = [] } = useProjectDeliverables(project?.id ?? '');

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [confirmClient, setConfirmClient] = useState<Client | null>(null);
  const [confirmDeliverable, setConfirmDeliverable] = useState<Deliverable | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const addClient = useMutation({
    mutationFn: () => api.post(`/projects/${project?.id}/clients`, { name, email }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', project?.id, 'clients'] });
      void qc.invalidateQueries({ queryKey: ['clients'] });
      setClientModalOpen(false);
      setName('');
      setEmail('');
    },
  });

  const removeClient = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', project?.id, 'clients'] });
      setConfirmClient(null);
    },
  });

  const uploadDeliverable = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post(`/projects/${project?.id}/deliverables`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['projects', project?.id, 'deliverables'] }),
  });

  const removeDeliverable = useMutation({
    mutationFn: (id: string) => api.delete(`/deliverables/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects', project?.id, 'deliverables'] });
      setConfirmDeliverable(null);
    },
  });

  return (
    <AdminLayout>
      <div className="flex gap-2 text-sm text-gray-500 mb-2">
        <Link to="/admin/companies" className="hover:text-gray-300 transition-colors">Entreprises</Link>
        <span>/</span>
        <Link to={`/admin/companies/${companySlug}`} className="hover:text-gray-300 transition-colors">
          {company?.name ?? '...'}
        </Link>
        <span>/</span>
        <span className="text-gray-300">{project?.name ?? '...'}</span>
      </div>

      <h1 className="text-2xl font-bold mb-8">{project?.name ?? '...'}</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Clients */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Utilisateurs</h2>
            <Button onClick={() => setClientModalOpen(true)}>+ Ajouter</Button>
          </div>
          {clients.length === 0 ? (
            <p className="text-gray-600 text-sm">Aucun utilisateur</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {clients.map((c, i) => {
                const remainder = clients.length % 4;
                const isLast = i === clients.length - 1;
                const span = isLast && remainder === 1 ? 'col-span-4'
                  : isLast && remainder === 2 ? 'col-span-2'
                  : isLast && remainder === 3 ? 'col-span-2'
                  : '';
                return (
                  <div key={c.id} className={span}>
                    <UserCard user={c} onDelete={setConfirmClient} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Livrables */}
        <div>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Livrables</h2>
          </div>
          <div className="flex flex-col gap-3">
            {deliverables.length > 0 && (
              <div className="flex flex-col gap-1">
                {deliverables.map((d) => (
                  <div key={d.id} className="group flex items-center justify-between bg-gray-900 border border-gray-800 rounded-md px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => downloadFile(d.url, d.name)}
                        className="text-sm text-white hover:text-indigo-400 truncate transition-colors text-left cursor-pointer"
                      >
                        {d.name}
                      </button>
                      <span className="text-xs text-gray-600 shrink-0">{formatSize(d.size)}</span>
                    </div>
                    <button
                      onClick={() => setConfirmDeliverable(d)}
                      className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <FileDropZone
              onFiles={(files) => files.forEach((f) => uploadDeliverable.mutate(f))}
              loading={uploadDeliverable.isPending}
            />
          </div>
        </div>
      </div>

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
    </AdminLayout>
  );
}
