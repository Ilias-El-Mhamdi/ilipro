import type { Company } from '../../../lib/queries';
import { Modal } from '../../../components/molecules/Modal';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';

interface Props {
  editing: Company | null;
  name: string;
  onNameChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function CompanyFormModal({ editing, name, onNameChange, onClose, onSubmit }: Props) {
  return (
    <Modal title={editing ? "Modifier l'entreprise" : 'Nouvelle entreprise'} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex flex-col gap-4">
        <Input label="Nom" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Nom de l'entreprise" autoFocus />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={!name.trim()}>{editing ? 'Mettre à jour' : 'Créer'}</Button>
        </div>
      </form>
    </Modal>
  );
}
