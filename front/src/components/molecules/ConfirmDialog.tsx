import { Button } from '../atoms/Button';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-sm shadow-xl">
        <p className="text-white mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onCancel}>Annuler</Button>
          <Button variant="danger" onClick={onConfirm}>Supprimer</Button>
        </div>
      </div>
    </div>
  );
}
