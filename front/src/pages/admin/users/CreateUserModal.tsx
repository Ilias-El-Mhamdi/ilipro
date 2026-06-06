import { Modal } from '../../../components/molecules/Modal';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';

interface Props {
  firstName: string;
  onFirstNameChange: (v: string) => void;
  lastName: string;
  onLastNameChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function CreateUserModal({ firstName, onFirstNameChange, lastName, onLastNameChange, email, onEmailChange, onClose, onSubmit, isPending }: Props) {
  return (
    <Modal title="Nouvel utilisateur" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <Input label="Prénom" value={firstName} onChange={(e) => onFirstNameChange(e.target.value)} placeholder="Prénom" autoFocus />
          <Input label="Nom" value={lastName} onChange={(e) => onLastNameChange(e.target.value)} placeholder="Nom" />
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="email@exemple.com" />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={!firstName.trim() || !lastName.trim() || !email.trim() || isPending}>Créer</Button>
        </div>
      </form>
    </Modal>
  );
}
