import type { Client } from '../../../lib/queries';
import { Modal } from '../Modal';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';

interface Props {
  client: Client;
  firstNameDraft: string;
  onFirstNameChange: (v: string) => void;
  lastNameDraft: string;
  onLastNameChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function UserCardEditModal({ client, firstNameDraft, onFirstNameChange, lastNameDraft, onLastNameChange, onClose, onSubmit, isPending }: Props) {
  return (
    <Modal title={`Modifier — ${client.firstName} ${client.lastName}`} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <Input label="Prénom" value={firstNameDraft} onChange={(e) => onFirstNameChange(e.target.value)} placeholder="Prénom" autoFocus />
          <Input label="Nom" value={lastNameDraft} onChange={(e) => onLastNameChange(e.target.value)} placeholder="Nom" />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={!firstNameDraft.trim() || !lastNameDraft.trim() || isPending}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
