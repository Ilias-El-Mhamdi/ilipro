import type { Project } from '../../../lib/queries';
import { Button } from '../../atoms/Button';

const LINK_BUTTON_STYLE = {
  app:       'border-green-800 text-green-400 hover:border-green-600 hover:text-green-300',
  doc:       'border-blue-800 text-blue-400 hover:border-blue-600 hover:text-blue-300',
  changelog: 'border-red-800 text-red-400 hover:border-red-600 hover:text-red-300',
} as const;

function LinkButton({ href, label, variant }: { href: string; label: string; variant: keyof typeof LINK_BUTTON_STYLE }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`text-xs px-2 py-1 rounded border transition-colors ${LINK_BUTTON_STYLE[variant]}`}>
      {label}
    </a>
  );
}

interface Props {
  project: Project;
  idCopied: boolean;
  onCopyId: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCardHeader({ project, idCopied, onCopyId, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-900/60 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-white">{project.name}</span>
        {project.appUrl && <LinkButton href={project.appUrl} label="App" variant="app" />}
        {project.docsUrl && <LinkButton href={project.docsUrl} label="Doc" variant="doc" />}
        {project.changelogUrl && <LinkButton href={project.changelogUrl} label="Changelog" variant="changelog" />}
        <button onClick={onCopyId} className="group/id flex items-center gap-1.5 cursor-pointer" title="Copier l'ID projet">
          <span className="text-xs font-mono text-gray-600 group-hover/id:text-gray-400 transition-colors truncate max-w-[80px]">
            {project.id}
          </span>
          {idCopied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-700 group-hover/id:text-gray-400 transition-colors shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:border-indigo-500 hover:text-indigo-300 transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Éditer
        </button>
        <Button variant="danger" onClick={onDelete}>Supprimer</Button>
      </div>
    </div>
  );
}
