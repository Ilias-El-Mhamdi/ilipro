interface Props {
    name: string;
    slug: string;
    hasProjects: boolean;
    isOpen: boolean;
    isActive: boolean;
    onToggle: () => void;
    onNavigate: (to: string) => void;
}

export function CompanyRowHeader({name, slug, hasProjects, isOpen, isActive, onToggle, onNavigate}: Props) {
    return (
        <div className={`flex items-center gap-1 rounded-md group ${isActive ? 'bg-indigo-900/40' : ''}`}>
            <button
                onClick={onToggle}
                className="p-1 text-gray-500 hover:text-gray-300 cursor-pointer"
            >
                {hasProjects
                    ? <ChevronIcon open={isOpen}/>
                    : <span className="w-3 h-3 block"/>
                }
            </button>
            <button
                onClick={() => onNavigate(`/admin/companies/${slug}`)}
                className={`flex-1 text-left py-1.5 text-sm truncate cursor-pointer ${
                    isActive ? 'text-white font-medium' : 'text-gray-300 hover:text-white'
                }`}
            >
                {name}
            </button>
        </div>
    );
}

function ChevronIcon({open}: { open: boolean }) {
    return (
        <svg
            className={`w-3 h-3 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
    );
}
