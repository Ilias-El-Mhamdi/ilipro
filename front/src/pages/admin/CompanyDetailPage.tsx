import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCompanies, useCompanyProjects } from '../../lib/queries';
import type { Project } from '../../lib/queries';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Modal } from '../../components/molecules/Modal';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';
import { ProjectCard } from '../../components/organisms/ProjectCard';
import { api } from '../../lib/api';

export function CompanyDetailPage() {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { hash } = useLocation();
  const qc = useQueryClient();

  const { data: companies = [] } = useCompanies();
  const { data: projects = [], isLoading } = useCompanyProjects(companySlug!);

  useEffect(() => {
    if (!hash || isLoading) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, isLoading, projects]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmProject, setConfirmProject] = useState<Project | null>(null);
  const [name, setName] = useState('');

  const company = companies.find((c) => c.slug === companySlug);

  const addProject = useMutation({
    mutationFn: () => api.post(`/companies/${companySlug}/projects`, { name }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'projects'] });
      void qc.invalidateQueries({ queryKey: ['projects'] });
      setModalOpen(false);
      setName('');
    },
  });

  const removeProject = useMutation({
    mutationFn: (projectId: string) => api.delete(`/projects/${projectId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'projects'] });
      void qc.invalidateQueries({ queryKey: ['projects'] });
      setConfirmProject(null);
    },
  });

  return (
    <AdminLayout>
      <div className="mb-2">
        <Link to="/admin/companies" className="text-gray-500 hover:text-gray-300 text-sm">
          ← Entreprises
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{company?.name ?? '...'}</h1>
        <Button onClick={() => setModalOpen(true)}>+ Ajouter un projet</Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">Aucun projet pour cette entreprise.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <div key={project.id} id={`project-${project.slug}`}>
              <ProjectCard
                project={project}
                companySlug={companySlug!}
                onDeleteProject={(p) => setConfirmProject(p)}
              />
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title="Nouveau projet" onClose={() => setModalOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); addProject.mutate(); }} className="flex flex-col gap-4">
            <Input
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du projet"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={!name.trim()}>Créer</Button>
            </div>
          </form>
        </Modal>
      )}

      {confirmProject && (
        <ConfirmDialog
          message={`Supprimer le projet « ${confirmProject.name} » ? Cette action est irréversible.`}
          onConfirm={() => removeProject.mutate(confirmProject.id)}
          onCancel={() => setConfirmProject(null)}
        />
      )}
    </AdminLayout>
  );
}
