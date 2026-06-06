import type { useLinkClient } from '../../../hooks/companyDetail/useLinkClient';
import { Modal } from '../../../components/molecules/Modal';
import { Button } from '../../../components/atoms/Button';

interface Props {
  link: ReturnType<typeof useLinkClient>;
}

export function LinkClientModal({ link }: Props) {
  return (
    <Modal title="Lier un utilisateur existant" onClose={() => link.setModalOpen(false)}>
      <div className="flex flex-col gap-4">
        <input
          autoFocus
          value={link.search}
          onChange={(e) => link.setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
        />
        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
          {link.linkable.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Aucun utilisateur disponible.</p>
          ) : (
            link.linkable.map((c) => (
              <button
                key={c.id}
                onClick={() => link.setSelectedId(c.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                  link.selectedId === c.id
                    ? 'bg-indigo-600/30 border border-indigo-500'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {c.firstName[0]}{c.lastName[0]}
                </div>
                <div>
                  <div className="text-sm text-white font-medium">{c.firstName} {c.lastName}</div>
                  <div className="text-xs text-gray-400">{c.email}</div>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={() => link.setModalOpen(false)}>Annuler</Button>
          <Button
            type="button"
            disabled={!link.selectedId || link.mutation.isPending}
            onClick={() => link.selectedId && link.mutation.mutate(link.selectedId)}
          >
            Lier
          </Button>
        </div>
      </div>
    </Modal>
  );
}
