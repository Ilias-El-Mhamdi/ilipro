import type {User} from '../../../../../lib/queries';
import {Modal} from '../../../../../components/molecules/Modal';
import {Input} from '../../../../../components/atoms/Input';
import {Button} from '../../../../../components/atoms/Button';

interface Props {
    user: User;
    firstNameDraft: string;
    onFirstNameChange: (v: string) => void;
    lastNameDraft: string;
    onLastNameChange: (v: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    isPending: boolean;
}

export function UserCardEditModal({
                                      user,
                                      firstNameDraft,
                                      onFirstNameChange,
                                      lastNameDraft,
                                      onLastNameChange,
                                      onClose,
                                      onSubmit,
                                      isPending
                                  }: Props) {
    return (
        <Modal title={`Modifier — ${user.firstName} ${user.lastName}`} onClose={onClose}>
            <form onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }} className="flex flex-col gap-4">
                <div className="flex gap-3">
                    <Input label="Prénom" value={firstNameDraft} onChange={(e) => onFirstNameChange(e.target.value)}
                           placeholder="Prénom" autoFocus/>
                    <Input label="Nom" value={lastNameDraft} onChange={(e) => onLastNameChange(e.target.value)}
                           placeholder="Nom"/>
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
