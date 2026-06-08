import { useRef, useState, type DragEvent } from 'react';

interface Props {
  onFiles: (files: File[]) => void;
  loading?: boolean;
}

export function FileDropZone({ onFiles, loading }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = '';
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${dragging ? 'border-indigo-500 bg-indigo-950/30' : 'border-gray-700 hover:border-gray-600'}
        ${loading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <p className="text-gray-400 text-sm">
        {loading
          ? 'Envoi en cours...'
          : <>Glissez vos fichiers ici ou <span className="text-indigo-400">cliquez pour parcourir</span></>
        }
      </p>
    </div>
  );
}
