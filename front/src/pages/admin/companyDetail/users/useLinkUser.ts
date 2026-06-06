import {useState, useMemo} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import type {User} from '../../../../lib/queries';
import {api} from '../../../../lib/api';
import {toastSuccess, toastError} from '../../../../lib/toast';

export function useLinkUser(companySlug: string, users: User[], allUsers: User[]) {
    const qc = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const linkedIds = useMemo(() => new Set(users.map((u) => u.id)), [users]);

    const linkable = useMemo(() => {
        const q = search.toLowerCase();
        return allUsers.filter((u) => {
            if (linkedIds.has(u.id)) return false;
            if (!q) return true;
            return `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q);
        });
    }, [allUsers, linkedIds, search]);

    const mutation = useMutation({
        mutationFn: (userId: string) =>
            api.patch(`/companies/${companySlug}/users/${userId}/link`, {}),
        onSuccess: () => {
            void qc.invalidateQueries({queryKey: ['companies', companySlug, 'users']});
            setModalOpen(false);
            setSearch('');
            setSelectedId(null);
            toastSuccess('Utilisateur lié');
        },
        onError: toastError,
    });

    return {
        modalOpen, setModalOpen,
        search, setSearch,
        selectedId, setSelectedId,
        linkable,
        mutation,
    };
}
