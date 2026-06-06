import { Link } from 'react-router-dom';
import { AdminLayout } from '../../../components/templates/AdminLayout';
import { ConfirmDialog } from '../../../components/molecules/ConfirmDialog';
import { useCompanyDetail } from '../../../hooks/useCompanyDetail';
import { CompanyHeader } from './CompanyHeader';
import { ClientsSection } from './ClientsSection';
import { ProjectsSection } from './ProjectsSection';
import { AddProjectModal } from './AddProjectModal';
import { AddClientModal } from './AddClientModal';
import { LinkClientModal } from './LinkClientModal';

export function CompanyDetailPage() {
  const {
    companySlug, company,
    projects, projectsLoading,
    clients, clientsLoading,
    rename,
    manageProjects,
    manageClients,
    linkClient,
  } = useCompanyDetail();

  return (
    <AdminLayout>
      <div className="mb-2">
        <Link to="/admin/companies" className="text-gray-500 hover:text-gray-300 text-sm">← Entreprises</Link>
      </div>

      <CompanyHeader company={company} rename={rename} />

      <ClientsSection
        clients={clients}
        isLoading={clientsLoading}
        projects={projects}
        companySlug={companySlug}
        companyId={company?.id ?? ''}
        onDelete={manageClients.setConfirm}
        onAdd={() => manageClients.setModalOpen(true)}
        onLink={() => { linkClient.setModalOpen(true); linkClient.setSearch(''); linkClient.setSelectedId(null); }}
      />

      <ProjectsSection
        projects={projects}
        isLoading={projectsLoading}
        clients={clients}
        companySlug={companySlug}
        onDelete={manageProjects.setConfirm}
        onAdd={() => manageProjects.setModalOpen(true)}
      />

      {manageProjects.modalOpen && <AddProjectModal manage={manageProjects} />}
      {manageClients.modalOpen && <AddClientModal manage={manageClients} />}
      {linkClient.modalOpen && <LinkClientModal link={linkClient} />}

      {manageProjects.confirm && (
        <ConfirmDialog
          message={`Supprimer le projet « ${manageProjects.confirm.name} » ? Cette action est irréversible.`}
          onConfirm={() => manageProjects.remove.mutate(manageProjects.confirm!.id)}
          onCancel={() => manageProjects.setConfirm(null)}
        />
      )}
      {manageClients.confirm && (
        <ConfirmDialog
          message={`Retirer « ${manageClients.confirm.firstName} ${manageClients.confirm.lastName} » de cette entreprise ?`}
          onConfirm={() => manageClients.remove.mutate(manageClients.confirm!.id)}
          onCancel={() => manageClients.setConfirm(null)}
        />
      )}
    </AdminLayout>
  );
}
