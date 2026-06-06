interface Props {
    value: string;
    onChange: (q: string) => void;
}

export function SearchInput({value, onChange}: Props) {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
