import type { Deliverable } from '../../../lib/queries';
import { FileDropZone } from '../../molecules/FileDropZone';
import { downloadDeliverable, formatSize } from '../../../lib/utils';

interface Props {
  projectId: string;
  deliverables: Deliverable[];
  onDeleteClick: (d: Deliverable) => void;
  onFiles: (files: File[]) => void;
  uploading: boolean;
}

export function ProjectDeliverablesSection({ projectId, deliverables, onDeleteClick, onFiles, uploading }: Props) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <span className="text-xs text-gray-500 uppercase tracking-wide">Livrables</span>
      {deliverables.length > 0 && (
        <ul className="flex flex-col gap-1">
          {deliverables.map((d) => (
            <li key={d.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => void downloadDeliverable(`/projects/${projectId}/deliverables/${d.id}/download`, d.name)}
                  className="text-sm text-white hover:text-indigo-400 truncate transition-colors text-left"
                >
                  {d.name}
                </button>
                <span className="text-xs text-gray-600 shrink-0">{formatSize(d.size)}</span>
              </div>
              <button
                onClick={() => onDeleteClick(d)}
                className="text-gray-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 cursor-pointer"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <FileDropZone onFiles={onFiles} loading={uploading} />
    </div>
  );
}
