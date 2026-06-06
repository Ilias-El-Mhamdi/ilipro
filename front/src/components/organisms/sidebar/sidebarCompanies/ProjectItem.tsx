interface Props {
    name: string;
    isActive: boolean;
    onClick: () => void;
}

export function ProjectItem({name, isActive, onClick}: Props) {
    return (
        <button
            onClick={onClick}
            className={`ml-6 w-full text-left py-1 px-2 text-sm transition-colors truncate block cursor-pointer ${
                isActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
            }`}
        >
            {name}
        </button>
    );
}
