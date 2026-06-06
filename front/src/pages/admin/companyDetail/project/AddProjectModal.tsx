import type {useManageProjects} from './useManageProjects';
import {Modal} from '../../../../components/molecules/Modal.tsx';
import {Input} from '../../../../components/atoms/Input.tsx';
import {Button} from '../../../../components/atoms/Button.tsx';

interface Props {
    manage: ReturnType<typeof useManageProjects>;
}

export function AddProjectModal({manage}: Props) {
    return (
        <Modal title="Nouveau projet" onClose={() => manage.setModalOpen(false)}>
            <form onSubmit={(e) => {
                e.preventDefault();
                manage.add.mutate();
            }} className="flex flex-col gap-4">
                <Input label="Nom" value={manage.name} onChange={(e) => manage.setName(e.target.value)}
                       placeholder="Nom du projet" autoFocus/>
                <Input label="URL App (optionnel)" value={manage.appUrl}
                       onChange={(e) => manage.setAppUrl(e.target.value)} placeholder="https://app.exemple.com"/>
                <Input label="URL Documentation (optionnel)" value={manage.docsUrl}
                       onChange={(e) => manage.setDocsUrl(e.target.value)} placeholder="https://docs.exemple.com"/>
                <Input label="URL Changelog (optionnel)" value={manage.changelogUrl}
                       onChange={(e) => manage.setChangelogUrl(e.target.value)}
                       placeholder="https://changelog.exemple.com"/>
                <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={() => manage.setModalOpen(false)}>Annuler</Button>
                    <Button type="submit" disabled={!manage.name.trim()}>Créer</Button>
                </div>
            </form>
        </Modal>
    );
}
