import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCompanies, useCompanyProjects, useCompanyClients, useClients } from '../lib/queries';
import type { Project, Client } from '../lib/queries';
import { api } from '../lib/api';

export function useCompanyDetail() {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { hash } = useLocation();
  const qc = useQueryClient();

  const { data: companies = [] } = useCompanies();
  const { data: projects = [], isLoading: projectsLoading } = useCompanyProjects(companySlug!);
  const { data: clients = [], isLoading: clientsLoading } = useCompanyClients(companySlug!);
  const { data: allClients = [] } = useClients();

  const company = companies.find((c) => c.slug === companySlug);

  useEffect(() => {
    if (!hash || projectsLoading) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, projectsLoading, projects]);

  // ─── Rename ───────────────────────────────────────────────────────────────────
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [companyNameDraft, setCompanyNameDraft] = useState('');

  const renameCompany = useMutation({
    mutationFn: (name: string) => api.patch(`/companies/${companySlug}/name`, { name }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies'] });
      setEditingCompanyName(false);
    },
  });

  // ─── Projects ─────────────────────────────────────────────────────────────────
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [confirmProject, setConfirmProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectAppUrl, setProjectAppUrl] = useState('');
  const [projectDocsUrl, setProjectDocsUrl] = useState('');
  const [projectChangelogUrl, setProjectChangelogUrl] = useState('');

  const addProject = useMutation({
    mutationFn: () =>
      api.post(`/companies/${companySlug}/projects`, {
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

  // ─── Clients ──────────────────────────────────────────────────────────────────
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [confirmClient, setConfirmClient] = useState<Client | null>(null);
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const addClient = useMutation({
    mutationFn: () =>
      api.post(`/companies/${companySlug}/clients`, {
        firstName: clientFirstName,
        lastName: clientLastName,
        email: clientEmail,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      setClientModalOpen(false);
      setClientFirstName('');
      setClientLastName('');
      setClientEmail('');
    },
  });

  const removeClient = useMutation({
    mutationFn: (clientId: string) =>
      api.delete(`/companies/${companySlug}/clients/${clientId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      void qc.invalidateQueries({ queryKey: ['clients'] });
      setConfirmClient(null);
    },
  });

  // ─── Link client ──────────────────────────────────────────────────────────────
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

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
    mutationFn: (clientId: string) =>
      api.patch(`/companies/${companySlug}/clients/${clientId}/link`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies', companySlug, 'clients'] });
      setLinkModalOpen(false);
      setLinkSearch('');
      setSelectedClientId(null);
    },
  });

  return {
    companySlug: companySlug!,
    company,
    projects,
    projectsLoading,
    clients,
    clientsLoading,
    editingCompanyName, setEditingCompanyName,
    companyNameDraft, setCompanyNameDraft,
    renameCompany,
    projectModalOpen, setProjectModalOpen,
    confirmProject, setConfirmProject,
    projectName, setProjectName,
    projectAppUrl, setProjectAppUrl,
    projectDocsUrl, setProjectDocsUrl,
    projectChangelogUrl, setProjectChangelogUrl,
    addProject,
    removeProject,
    clientModalOpen, setClientModalOpen,
    confirmClient, setConfirmClient,
    clientFirstName, setClientFirstName,
    clientLastName, setClientLastName,
    clientEmail, setClientEmail,
    addClient,
    removeClient,
    linkModalOpen, setLinkModalOpen,
    linkSearch, setLinkSearch,
    selectedClientId, setSelectedClientId,
    linkableClients,
    linkClient,
  };
}
