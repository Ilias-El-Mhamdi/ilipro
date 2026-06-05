import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCompanies, useCompanyProjects, useCompanyClients } from '../../lib/queries';
import type { Project, Client } from '../../lib/queries';
import { AdminLayout } from '../../components/templates/AdminLayout';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Modal } from '../../components/molecules/Modal';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';
import { ProjectCard } from '../../components/organisms/ProjectCard';
import { UserCard } from '../../components/molecules/UserCard';
import { api } from '../../lib/api';

export function CompanyDetailPage() {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { hash } = useLocation();
  const qc = useQueryClient();

  const { data: companies = [] } = useCompanies();
  const { data: projects = [], isLoading: projectsLoading } = useCompanyProjects(companySlug!);
  const { data: clients = [], isLoading: clientsLoading } = useCompanyClients(companySlug!);

  useEffect(() => {
    if (!hash || projectsLoading) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, projectsLoading, projects]);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [confirmProject, setConfirmProject] = useState<Project | null>(null);
  const [confirmClient, setConfirmClient] = useState<Client | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectAppUrl, setProjectAppUrl] = useState('');
  const [projectDocsUrl, setProjectDocsUrl] = useState('');
  const [projectChangelogUrl, setProjectChangelogUrl] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const company = companies.find((c) => c.slug === companySlug);

  const addProject = useMutation({
    mutationFn: () => api.post(`/companies/${companySlug}/projects`, {
      name: projectName,
      appUrl: projectAppUrl || null,
      docsUrl: projectDocsUrl || null,
      changelogUrl: projectChangelogUrl || null,
    }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'projects'] });
      void qc.invalidateQueries({ queryKey: ['projects'] });
      setProjectModalOpen(false);
      setProjectName('');
      setProjectAppUrl('');
      setProjectDocsUrl('');
      setProjectChangelogUrl('');
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

  const addClient = useMutation({
    mutationFn: () =>
      api.post(`/companies/${companySlug}/clients`, { name: clientName, email: clientEmail }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      setClientModalOpen(false);
      setClientName('');
      setClientEmail('');
    },
  });

  const removeClient = useMutation({
    mutationFn: (clientId: string) => api.delete(`/clients/${clientId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      setConfirmClient(null);
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
        <Button onClick={() => setProjectModalOpen(true)}>+ Ajouter un projet</Button>
      </div>

      {/* Clients section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-gray-500 uppercase tracking-widest">Utilisateurs</h2>
          <button
            onClick={() => setClientModalOpen(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            + Ajouter
          </button>
        </div>

        {clientsLoading ? (
          <p className="text-gray-600 text-sm">Chargement...</p>
        ) : clients.length === 0 ? (
          <p className="text-gray-600 text-sm">Aucun client pour cette entreprise.</p>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {clients.map((client) => (
              <div key={client.id} id={`user-${client.id}`} className="rounded-xl transition-shadow duration-300">
                <UserCard
                  client={client}
                  license={client.license ?? null}
                  projects={projects}
                  companySlug={companySlug!}
                  onDelete={setConfirmClient}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs text-gray-500 uppercase tracking-widest">Projets</h2>
      </div>

      {projectsLoading ? (
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
                clients={clients}
                onDeleteProject={(p) => setConfirmProject(p)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add project modal */}
      {projectModalOpen && (
        <Modal title="Nouveau projet" onClose={() => setProjectModalOpen(false)}>
          <form
            onSubmit={(e) => { e.preventDefault(); addProject.mutate(); }}
            className="flex flex-col gap-4"
          >
            <Input
              label="Nom"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Nom du projet"
              autoFocus
            />
            <Input
              label="URL App (optionnel)"
              value={projectAppUrl}
              onChange={(e) => setProjectAppUrl(e.target.value)}
              placeholder="https://app.exemple.com"
            />
            <Input
              label="URL Documentation (optionnel)"
              value={projectDocsUrl}
              onChange={(e) => setProjectDocsUrl(e.target.value)}
              placeholder="https://docs.exemple.com"
            />
            <Input
              label="URL Changelog (optionnel)"
              value={projectChangelogUrl}
              onChange={(e) => setProjectChangelogUrl(e.target.value)}
              placeholder="https://changelog.exemple.com"
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setProjectModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={!projectName.trim()}>Créer</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add client modal */}
      {clientModalOpen && (
        <Modal title="Nouveau client" onClose={() => setClientModalOpen(false)}>
          <form
            onSubmit={(e) => { e.preventDefault(); addClient.mutate(); }}
            className="flex flex-col gap-4"
          >
            <Input
              label="Nom"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nom du client"
              autoFocus
            />
            <Input
              label="Email"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="email@exemple.com"
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setClientModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={!clientName.trim() || !clientEmail.trim()}>
                Créer
              </Button>
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

      {confirmClient && (
        <ConfirmDialog
          message={`Supprimer le client « ${confirmClient.name} » ?`}
          onConfirm={() => removeClient.mutate(confirmClient.id)}
          onCancel={() => setConfirmClient(null)}
        />
      )}
    </AdminLayout>
  );
}
