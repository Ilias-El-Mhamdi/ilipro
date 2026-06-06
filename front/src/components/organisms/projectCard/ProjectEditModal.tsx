import type { useProjectEdit } from '../../../hooks/projectCard/useProjectEdit';
import { Modal } from '../../molecules/Modal';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';

interface Props {
  projectName: string;
  edit: ReturnType<typeof useProjectEdit>;
}

export function ProjectEditModal({ projectName, edit }: Props) {
  return (
    <Modal title={`Éditer — ${projectName}`} onClose={() => edit.setOpen(false)}>
      <form onSubmit={(e) => { e.preventDefault(); edit.mutation.mutate(); }} className="flex flex-col gap-4">
        <Input label="Nom" value={edit.name} onChange={(e) => edit.setName(e.target.value)} placeholder="Nom du projet" autoFocus />
        <Input label="URL App" value={edit.appUrl} onChange={(e) => edit.setAppUrl(e.target.value)} placeholder="https://app.exemple.com" />
        <Input label="URL Documentation" value={edit.docsUrl} onChange={(e) => edit.setDocsUrl(e.target.value)} placeholder="https://docs.exemple.com" />
        <Input label="URL Changelog" value={edit.changelogUrl} onChange={(e) => edit.setChangelogUrl(e.target.value)} placeholder="https://changelog.exemple.com" />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={() => edit.setOpen(false)}>Annuler</Button>
          <Button type="submit" disabled={edit.mutation.isPending}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}
