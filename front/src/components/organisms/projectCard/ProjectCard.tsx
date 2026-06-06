import { useMemo } from 'react';
import { useProjectDeliverables } from '../../../lib/queries';
import type { Project, Client } from '../../../lib/queries';
import { ConfirmDialog } from '../../molecules/ConfirmDialog';
import { useProjectCardActions } from '../../../hooks/useProjectCardActions';
import { getAccessClients } from '../../../lib/utils';
import { ProjectCardHeader } from './ProjectCardHeader';
import { ProjectAccessSection } from './ProjectAccessSection';
import { ProjectDeliverablesSection } from './ProjectDeliverablesSection';
import { ProjectEditModal } from './ProjectEditModal';

interface Props {
  project: Project;
  companySlug: string;
  clients: Client[];
  onDeleteProject: (project: Project) => void;
}

export function ProjectCard({ project, companySlug, clients, onDeleteProject }: Props) {
  const { data: deliverables = [] } = useProjectDeliverables(project.id);
  const { clipboard, copyProjectId, deliverables: deliv, edit } = useProjectCardActions(project, companySlug);
  const accessClients = useMemo(() => getAccessClients(clients, project.id), [clients, project.id]);

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
        <ProjectAccessSection clients={accessClients} />
        <ProjectDeliverablesSection
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
