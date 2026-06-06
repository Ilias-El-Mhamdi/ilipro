interface Props {
  hasLicense: boolean;
  onManage: () => void;
  onSeeAs: () => void;
}

export function UserCardFooter({ hasLicense, onManage, onSeeAs }: Props) {
  return (
    <div className="border-t border-gray-800 px-3 py-2 flex gap-2 shrink-0">
      <button
        onClick={onManage}
        className="flex-1 text-center text-xs py-1.5 rounded-md border border-gray-700 text-gray-300 hover:border-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer"
      >
        {hasLicense ? 'Gérer' : '+ Licence'}
      </button>
      <button
        onClick={onSeeAs}
        className="flex-1 text-xs py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors cursor-pointer"
      >
        See as
      </button>
    </div>
  );
}
