import type {useManageUsers} from './useManageUsers';
import {Modal} from '../../../../components/molecules/Modal.tsx';
import {Input} from '../../../../components/atoms/Input.tsx';
import {Button} from '../../../../components/atoms/Button.tsx';

interface Props {
    manage: ReturnType<typeof useManageUsers>;
}

export function AddUserModal({manage}: Props) {
    return (
        <Modal title="Nouvel utilisateur" onClose={() => manage.setModalOpen(false)}>
            <form onSubmit={(e) => {
                e.preventDefault();
                manage.add.mutate();
            }} className="flex flex-col gap-4">
                <div className="flex gap-3">
                    <Input label="Prénom" value={manage.firstName} onChange={(e) => manage.setFirstName(e.target.value)}
                           placeholder="Prénom" autoFocus/>
                    <Input label="Nom" value={manage.lastName} onChange={(e) => manage.setLastName(e.target.value)}
                           placeholder="Nom"/>
                </div>
                <Input label="Email" type="email" value={manage.email} onChange={(e) => manage.setEmail(e.target.value)}
                       placeholder="email@exemple.com"/>
                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={() => manage.setModalOpen(false)}>Annuler</Button>
                    <Button type="submit"
                            disabled={!manage.firstName.trim() || !manage.lastName.trim() || !manage.email.trim()}>Créer</Button>
                </div>
            </form>
        </Modal>
    );
}
