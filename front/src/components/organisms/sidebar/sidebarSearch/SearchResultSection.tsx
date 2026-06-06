import type {ReactNode} from 'react';

interface Props {
    label: string;
    children: ReactNode;
}

export function SearchResultSection({label, children}: Props) {
    return (
        <div>
            <p className="text-gray-500 text-xs px-3 pt-2 pb-1 uppercase tracking-wide">{label}</p>
            {children}
        </div>
    );
}
