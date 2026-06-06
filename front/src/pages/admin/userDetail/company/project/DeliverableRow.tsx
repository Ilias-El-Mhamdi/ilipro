import type {Deliverable} from '../../../../../lib/queries.ts';
import {downloadFile, formatSize} from '../../../../../lib/utils.ts';

interface Props {
    deliverable: Deliverable;
}

export function DeliverableRow({deliverable}: Props) {
    return (
        <button
            onClick={() => void downloadFile(deliverable.url, deliverable.name)}
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group cursor-pointer"
        >
            <svg xmlns="http://www.w3.org/2000/svg"
                 className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17a3 3 0 003 3h12a3 3 0 003-3v-1"/>
            </svg>
            <span className="text-sm text-gray-300 group-hover:text-white truncate flex-1">{deliverable.name}</span>
            <span className="text-xs text-gray-600 shrink-0">{formatSize(deliverable.size)}</span>
        </button>
    );
}
