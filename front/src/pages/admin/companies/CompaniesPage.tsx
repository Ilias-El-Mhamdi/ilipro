import { AdminLayout } from '../../../components/templates/AdminLayout';
import { Button } from '../../../components/atoms/Button';
import { ConfirmDialog } from '../../../components/molecules/ConfirmDialog';
import { useCompanyCrud } from '../../../hooks/useCompanyCrud';
import { LoadingText } from '../../../components/atoms/LoadingText';
import { EmptyText } from '../../../components/atoms/EmptyText';
import { CompanyTable } from './CompanyTable';
import { CompanyFormModal } from './CompanyFormModal';

export function CompaniesPage() {
  const {
    companies, isLoading, navigate,
    modalOpen, editing, confirmId, setConfirmId,
    name, setName,
    remove, openCreate, openEdit, closeModal, submit, confirmCompany,
  } = useCompanyCrud();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Entreprises</h1>
        <Button onClick={openCreate}>+ Ajouter</Button>
      </div>

      {isLoading ? (
        <LoadingText />
      ) : companies.length === 0 ? (
        <EmptyText message="Aucune entreprise." />
      ) : (
        <CompanyTable
          companies={companies}
          onNavigate={(slug) => navigate(`/admin/companies/${slug}`)}
          onEdit={openEdit}
          onDelete={(e, slug) => { e.stopPropagation(); setConfirmId(slug); }}
        />
      )}

      {modalOpen && (
        <CompanyFormModal editing={editing} name={name} onNameChange={setName} onClose={closeModal} onSubmit={submit} />
      )}
      {confirmId && (
        <ConfirmDialog
          message={`Supprimer l'entreprise « ${confirmCompany?.name} » ? Cette action est irréversible.`}
          onConfirm={() => remove.mutate(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </AdminLayout>
  );
}
