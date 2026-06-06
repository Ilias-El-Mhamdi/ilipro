interface Props {
    count: number;
    onClick: () => void;
}

export function UserMoreButton({count, onClick}: Props) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left py-1 px-2 text-xs text-gray-600 hover:text-gray-400 cursor-pointer"
        >
            + {count} autres
        </button>
    );
}
