import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCompanies, useCompanyProjects, useCompanyClients, useClients } from '../../lib/queries';
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
  const { data: allClients = [] } = useClients();

  useEffect(() => {
    if (!hash || projectsLoading) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, projectsLoading, projects]);

  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [companyNameDraft, setCompanyNameDraft] = useState('');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [confirmProject, setConfirmProject] = useState<Project | null>(null);
  const [confirmClient, setConfirmClient] = useState<Client | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectAppUrl, setProjectAppUrl] = useState('');
  const [projectDocsUrl, setProjectDocsUrl] = useState('');
  const [projectChangelogUrl, setProjectChangelogUrl] = useState('');
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const company = companies.find((c) => c.slug === companySlug);

  const renameCompany = useMutation({
    mutationFn: (name: string) => api.patch(`/companies/${companySlug}/name`, { name }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies'] });
      setEditingCompanyName(false);
    },
  });

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
      api.post(`/companies/${companySlug}/clients`, { firstName: clientFirstName, lastName: clientLastName, email: clientEmail }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      setClientModalOpen(false);
      setClientFirstName('');
      setClientLastName('');
      setClientEmail('');
    },
  });

  const removeClient = useMutation({
    mutationFn: (clientId: string) => api.delete(`/companies/${companySlug}/clients/${clientId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      void qc.invalidateQueries({ queryKey: ['clients'] });
      setConfirmClient(null);
    },
  });

  const linkedIds = useMemo(() => new Set(clients.map((c) => c.id)), [clients]);

  const linkableClients = useMemo(() => {
    const q = linkSearch.toLowerCase();
    return allClients.filter((c) => {
      if (linkedIds.has(c.id)) return false;
      if (!q) return true;
      return `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q);
    });
  }, [allClients, linkedIds, linkSearch]);

  const linkClient = useMutation({
    mutationFn: (clientId: string) => api.patch(`/companies/${companySlug}/clients/${clientId}/link`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      setLinkModalOpen(false);
      setLinkSearch('');
      setSelectedClientId(null);
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
        {editingCompanyName ? (
          <form
            onSubmit={(e) => { e.preventDefault(); if (companyNameDraft.trim()) renameCompany.mutate(companyNameDraft.trim()); }}
            className="flex items-center gap-2"
          >
            <input
              autoFocus
              value={companyNameDraft}
              onChange={(e) => setCompanyNameDraft(e.target.value)}
              onBlur={() => setEditingCompanyName(false)}
              onKeyDown={(e) => e.key === 'Escape' && setEditingCompanyName(false)}
              className="text-2xl font-bold bg-transparent border-b border-indigo-500 outline-none text-white"
            />
          </form>
        ) : (
          <button
            className="group flex items-center gap-2 cursor-pointer"
            onClick={() => { setCompanyNameDraft(company?.name ?? ''); setEditingCompanyName(true); }}
            title="Cliquer pour renommer"
          >
            <h1 className="text-2xl font-bold group-hover:text-indigo-300 transition-colors">
              {company?.name ?? '...'}
            </h1>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Clients section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-gray-500 uppercase tracking-widest">Utilisateurs</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setLinkModalOpen(true); setLinkSearch(''); setSelectedClientId(null); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              + Lier
            </button>
            <button
              onClick={() => setClientModalOpen(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              + Ajouter
            </button>
          </div>
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
                  companyId={company?.id ?? ''}
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
        <button
          onClick={() => setProjectModalOpen(true)}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          + Ajouter
        </button>
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
            <div className="flex gap-3">
              <Input
                label="Prénom"
                value={clientFirstName}
                onChange={(e) => setClientFirstName(e.target.value)}
                placeholder="Prénom"
                autoFocus
              />
              <Input
                label="Nom"
                value={clientLastName}
                onChange={(e) => setClientLastName(e.target.value)}
                placeholder="Nom"
              />
            </div>
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
              <Button type="submit" disabled={!clientFirstName.trim() || !clientLastName.trim() || !clientEmail.trim()}>
                Créer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Link existing client modal */}
      {linkModalOpen && (
        <Modal title="Lier un utilisateur existant" onClose={() => setLinkModalOpen(false)}>
          <div className="flex flex-col gap-4">
            <input
              autoFocus
              value={linkSearch}
              onChange={(e) => setLinkSearch(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
            />
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
              {linkableClients.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Aucun utilisateur disponible.</p>
              ) : (
                linkableClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClientId(c.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      selectedClientId === c.id
                        ? 'bg-indigo-600/30 border border-indigo-500'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium">{c.firstName} {c.lastName}</div>
                      <div className="text-xs text-gray-400">{c.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setLinkModalOpen(false)}>
                Annuler
              </Button>
              <Button
                type="button"
                disabled={!selectedClientId || linkClient.isPending}
                onClick={() => selectedClientId && linkClient.mutate(selectedClientId)}
              >
                Lier
              </Button>
            </div>
          </div>
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
          message={`Retirer « ${confirmClient.firstName} ${confirmClient.lastName} » de cette entreprise ?`}
          onConfirm={() => removeClient.mutate(confirmClient.id)}
          onCancel={() => setConfirmClient(null)}
        />
      )}
    </AdminLayout>
  );
}
