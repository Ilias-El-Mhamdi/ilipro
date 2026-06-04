import type { Client } from '../../lib/queries';

interface Props {
  user: Client;
  onDelete: (user: Client) => void;
}

const PLAN = {
  name: 'Pro',
  status: 'Actif',
  renewal: '01/01/2027',
};

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserCard({ user, onDelete }: Props) {
  return (
    <div className="group relative bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-md">
      {/* Delete */}
      <button
        onClick={() => onDelete(user)}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
      >
        ✕
      </button>

      {/* Header band */}
      <div className="bg-indigo-900/40 border-b border-indigo-800/40 px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials(user.name)}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{user.name}</p>
          <p className="text-indigo-300 text-xs truncate">{user.email}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {/* Subscription */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Abonnement</span>
          <span className="text-xs font-medium text-white">{PLAN.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Statut</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            {PLAN.status}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Renouvellement</span>
          <span className="text-xs text-gray-300">{PLAN.renewal}</span>
        </div>

        <div className="border-t border-gray-800 mt-1 pt-3 flex gap-2">
          <a
            href="https://stripe.com"
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center text-xs py-1.5 rounded-md border border-gray-700 text-gray-300 hover:border-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Stripe billing
          </a>
          <button
            onClick={() => window.open(window.location.href, '_blank')}
            className="flex-1 text-xs py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors cursor-pointer"
          >
            See as
          </button>
        </div>
      </div>
    </div>
  );
}
