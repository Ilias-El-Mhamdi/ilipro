import { useMemo } from 'react';
import type { Project } from 'platform/contracts/shared/project';
import type { CompanyUser } from 'platform/contracts/adminDashboard/linkUser/listCompanyUsers/listCompanyUsers.response';
import { useProjectDeliverables } from '../../api/projects';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useProjectCardActions } from './useProjectCardActions';
import { ProjectCardHeader } from './ProjectCardHeader';
import { ProjectAccessSection } from './ProjectAccessSection';
import { ProjectDeliverablesSection } from './ProjectDeliverablesSection';
import { ProjectEditModal } from './ProjectEditModal';

function getAccessUsers(users: CompanyUser[], projectId: string): CompanyUser[] {
  return users.filter((u) => {
    const license = u.license;
    if (!license || license.status !== 'ACTIVE') return false;
    if (license.type === 'ADMIN') return true;
    return license.projectAccess.some((a) => a.projectId === projectId);
  });
}

interface Props {
  project: Project;
  companySlug: string;
  users: CompanyUser[];
  onDeleteProject: (project: Project) => void;
}

export function ProjectCard({
  project,
  companySlug,
  users,
  onDeleteProject,
}: Props) {
  const { data: deliverables = [] } = useProjectDeliverables(project.id);
  const {
    clipboard,
    copyProjectId,
    deliverables: deliv,
    edit,
  } = useProjectCardActions(project, companySlug);
  const accessUsers = useMemo(
    () => getAccessUsers(users, project.id),
    [users, project.id],
  );

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <ProjectCardHeader
        project={project}
        idCopied={clipboard.copied}
        onCopyId={copyProjectId}
        onEdit={edit.openModal}
        onDelete={() => onDeleteProject(project)}
      />
      <div className="grid grid-cols-2 divide-x divide-gray-800">
        <ProjectAccessSection users={accessUsers} />
        <ProjectDeliverablesSection
          projectId={project.id}
          deliverables={deliverables}
          onDeleteClick={deliv.setConfirm}
          onFiles={deliv.handleFiles}
          uploading={deliv.upload.isPending}
        />
      </div>

      {edit.open && <ProjectEditModal projectName={project.name} edit={edit} />}

      {deliv.confirm && (
        <ConfirmDialog
          message={`Supprimer le livrable « ${deliv.confirm.name} » ?`}
          onConfirm={() => deliv.remove.mutate(deliv.confirm!.id)}
          onCancel={() => deliv.setConfirm(null)}
        />
      )}
    </div>
  );
}
