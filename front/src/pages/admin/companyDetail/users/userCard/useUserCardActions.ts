import {useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import type {User} from '../../../../../lib/queries';
import {api} from '../../../../../lib/api';
import {toastSuccess, toastError} from '../../../../../lib/toast';

export function useUserCardActions(user: User, companySlug: string) {
    const qc = useQueryClient();

    const [firstNameDraft, setFirstNameDraft] = useState(user.firstName);
    const [lastNameDraft, setLastNameDraft] = useState(user.lastName);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const updateUser = useMutation({
        mutationFn: () =>
            api.patch(`/users/${user.id}`, {
                firstName: firstNameDraft.trim(),
                lastName: lastNameDraft.trim(),
            }),
        onSuccess: () => {
            void qc.invalidateQueries({queryKey: ['companies', companySlug, 'users']});
            setEditModalOpen(false);
            toastSuccess('Utilisateur mis à jour');
        },
        onError: toastError,
    });

    function openEditModal() {
        setFirstNameDraft(user.firstName);
        setLastNameDraft(user.lastName);
        setEditModalOpen(true);
    }

    return {
        firstNameDraft, setFirstNameDraft,
        lastNameDraft, setLastNameDraft,
        editModalOpen, setEditModalOpen,
        updateUser,
        openEditModal,
    };
}
