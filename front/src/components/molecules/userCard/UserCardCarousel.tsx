import type { License, Project } from '../../../lib/queries';
import { PanelOverview, PanelProjects, PanelMachines } from '../licensePanel';

const PANELS = ['Général', 'Projets', 'Machines'] as const;

interface Props {
  panel: number;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (i: number) => void;
  license: License | null;
  projects: Project[];
}

export function UserCardCarousel({ panel, onPrev, onNext, onDotClick, license, projects }: Props) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
        <button onClick={onPrev} className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-xs px-1">‹</button>
        <div className="flex gap-1">
          {PANELS.map((_, i) => (
            <button
              key={i}
              onClick={() => onDotClick(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${i === panel ? 'bg-indigo-400' : 'bg-gray-700'}`}
            />
          ))}
        </div>
        <button onClick={onNext} className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-xs px-1">›</button>
      </div>
      <div className="flex-1 px-3 pt-2 pb-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {panel === 0 && <PanelOverview license={license} />}
        {panel === 1 && <PanelProjects license={license} projects={projects} />}
        {panel === 2 && <PanelMachines license={license} />}
      </div>
    </div>
  );
}
