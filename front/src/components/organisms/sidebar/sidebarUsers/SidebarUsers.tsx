import {Link} from 'react-router-dom';
import type {User} from '../../../../lib/queries.ts';
import {UserItem} from './UserItem.tsx';
import {UserMoreButton} from './UserMoreButton.tsx';

const VISIBLE_COUNT = 5;

interface Props {
    users: User[];
    isUsersActive: boolean;
    activePath: string;
    navigate: (to: string) => void;
}

export function SidebarUsers({users, isUsersActive, activePath, navigate}: Props) {
    return (
        <div className="mb-4">
            <Link
                to="/admin/users"
                className={`text-xs uppercase tracking-wide px-2 mb-2 block transition-colors ${
                    isUsersActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
                Utilisateurs
            </Link>

            {users.length === 0 ? (
                <p className="text-gray-600 text-xs px-2">Aucun utilisateur</p>
            ) : (
                users.slice(0, VISIBLE_COUNT).map((u) => (
                    <UserItem
                        key={u.id}
                        user={u}
                        isActive={activePath === `/admin/users/${u.slug}`}
                        onClick={() => navigate(`/admin/users/${u.slug}`)}
                    />
                ))
            )}

            {users.length > VISIBLE_COUNT && (
                <UserMoreButton
                    count={users.length - VISIBLE_COUNT}
                    onClick={() => navigate('/admin/users')}
                />
            )}
        </div>
    );
}
