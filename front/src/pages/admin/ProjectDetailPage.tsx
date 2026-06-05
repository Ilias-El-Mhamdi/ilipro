import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCompanies, useCompanyProjects, useCompanyClients, useProjectDeliverables } from '../../lib/queries';
import type { Deliverable } from '../../lib/queries';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { FileDropZone } from '../../components/molecules/FileDropZone';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';
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
  const { data: allClients = [] } = useCompanyClients(companySlug!);

  const company = companies.find((c) => c.slug === companySlug);
  const project = projects.find((p) => p.slug === projectSlug);

  const { data: deliverables = [] } = useProjectDeliverables(project?.id ?? '');

  const [confirmDeliverable, setConfirmDeliverable] = useState<Deliverable | null>(null);

  // Clients with active license access to this project
  const accessClients = allClients.filter((c) => {
    const license = c.license;
    if (!license || license.status !== 'ACTIVE') return false;
    if (license.type === 'ADMIN') return true;
    return license.projectAccess.some((a) => a.projectId === project?.id);
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
        {/* Clients avec accès */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Accès ({accessClients.length})
            </h2>
          </div>
          {accessClients.length === 0 ? (
            <p className="text-gray-600 text-sm">Aucun client — gérez les licences depuis la page entreprise.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {accessClients.map((c) => (
                <UserCard
                  key={c.id}
                  client={c}
                  license={c.license ?? null}
                  projects={projects}
                  companySlug={companySlug!}
                  onDelete={() => {}}
                />
              ))}
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
