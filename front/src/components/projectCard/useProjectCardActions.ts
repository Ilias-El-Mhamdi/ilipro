import type { Project } from '../../lib/queries';
import { useClipboard } from '../../hooks/useClipboard';
import { useDeliverableActions } from './useDeliverableActions';
import { useProjectEdit } from './useProjectEdit';

export function useProjectCardActions(project: Project, companySlug: string) {
  const clipboard = useClipboard();
  const deliverables = useDeliverableActions(project.id);
  const edit = useProjectEdit(project, companySlug);

  return {
    clipboard,
    copyProjectId: () => clipboard.copy(project.id),
    deliverables,
    edit,
  };
}
