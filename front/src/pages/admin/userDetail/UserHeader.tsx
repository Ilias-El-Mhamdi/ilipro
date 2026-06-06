import { useClipboard } from '../../../hooks/useClipboard';

interface UserHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
}

export function UserHeader({ firstName, lastName, email }: UserHeaderProps) {
  const { copied, copy } = useClipboard();

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-1">{firstName} {lastName}</h1>
      <div className="flex items-center gap-2 group/email">
        <button
          onClick={() => copy(email)}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer"
        >
          {email}
        </button>
        <button
          onClick={() => copy(email)}
          className="opacity-0 group-hover/email:opacity-100 transition-opacity cursor-pointer text-gray-600 hover:text-gray-300"
          title="Copier l'email"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
