import type { useLinkUser } from './useLinkUser';
import type { User } from '../../../../lib/queries';
import { Modal } from '../../../../components/molecules/Modal.tsx';
import { Button } from '../../../../components/atoms/Button.tsx';

interface Props {
  link: ReturnType<typeof useLinkUser>;
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Rechercher par nom ou email..."
      className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
    />
  );
}

function UserOption({ user, selected, onSelect }: { user: User; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
        selected ? 'bg-indigo-600/30 border border-indigo-500' : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {user.firstName[0]}{user.lastName[0]}
      </div>
      <div>
        <div className="text-sm text-white font-medium">{user.firstName} {user.lastName}</div>
        <div className="text-xs text-gray-400">{user.email}</div>
      </div>
    </button>
  );
}

function UserList({ users, selectedId, onSelect }: { users: User[]; selectedId: string | null; onSelect: (id: string) => void }) {
  if (users.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-4">Aucun utilisateur disponible.</p>;
  }
  return (
    <>
      {users.map((u) => (
        <UserOption key={u.id} user={u} selected={selectedId === u.id} onSelect={() => onSelect(u.id)} />
      ))}
    </>
  );
}

export function LinkUserModal({ link }: Props) {
  return (
    <Modal title="Lier un utilisateur existant" onClose={() => link.setModalOpen(false)}>
      <div className="flex flex-col gap-4">
        <SearchInput value={link.search} onChange={link.setSearch} />
        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
          <UserList users={link.linkable} selectedId={link.selectedId} onSelect={link.setSelectedId} />
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
