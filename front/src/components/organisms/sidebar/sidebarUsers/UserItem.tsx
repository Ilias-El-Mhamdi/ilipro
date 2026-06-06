import type {User} from '../../../../lib/queries.ts';

interface Props {
    user: User;
    isActive: boolean;
    onClick: () => void;
}

export function UserItem({user, isActive, onClick}: Props) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left py-1.5 px-2 text-sm truncate rounded-md cursor-pointer transition-colors ${
                isActive ? 'text-white bg-indigo-900/40' : 'text-gray-400 hover:text-white'
            }`}
        >
            {user.firstName} {user.lastName}
        </button>
    );
}
