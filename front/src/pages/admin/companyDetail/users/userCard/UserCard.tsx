import {useState} from 'react';
import type {User, License, Project} from '../../../../../lib/queries';
import {LicenseModal} from '../../../../../components/molecules/LicenseModal';
import {UserCardHeader} from './UserCardHeader';
import {UserCardCarousel} from './UserCardCarousel';
import {UserCardFooter} from './UserCardFooter';
import {UserCardEditModal} from './UserCardEditModal';
import {useUserCardActions} from './useUserCardActions';
import {useClipboard} from '../../../../../hooks/useClipboard';
import {useCarousel} from '../../../../../hooks/useCarousel';

interface Props {
    user: User;
    license: License | null;
    projects: Project[];
    companySlug: string;
    companyId: string;
    onDelete: (user: User) => void;
}

const PANELS_LENGTH = 3;

export function UserCard({user, license, projects, companySlug, companyId, onDelete}: Props) {
    const [licenseModalOpen, setLicenseModalOpen] = useState(false);
    const editActions = useUserCardActions(user, companySlug);
    const clipboard = useClipboard();
    const carousel = useCarousel(PANELS_LENGTH);

    return (
        <>
            <div
                className="group relative flex flex-col bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-md w-full h-72">
                <button
                    onClick={() => onDelete(user)}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                >
                    ✕
                </button>
                <UserCardHeader
                    user={user}
                    onEditClick={editActions.openEditModal}
                    onCopyEmail={() => clipboard.copy(user.email)}
                    copied={clipboard.copied}
                />
                <UserCardCarousel
                    panel={carousel.panel}
                    onPrev={carousel.prev}
                    onNext={carousel.next}
                    onDotClick={carousel.setPanel}
                    license={license}
                    projects={projects}
                />
                <UserCardFooter
                    hasLicense={!!license}
                    onManage={() => setLicenseModalOpen(true)}
                    onSeeAs={() => window.open(`/user/${user.slug}`, '_blank')}
                />
            </div>

            {editActions.editModalOpen && (
                <UserCardEditModal
                    user={user}
                    firstNameDraft={editActions.firstNameDraft}
                    onFirstNameChange={editActions.setFirstNameDraft}
                    lastNameDraft={editActions.lastNameDraft}
                    onLastNameChange={editActions.setLastNameDraft}
                    onClose={() => editActions.setEditModalOpen(false)}
                    onSubmit={editActions.updateUser.mutate}
                    isPending={editActions.updateUser.isPending}
                />
            )}

            {licenseModalOpen && (
                <LicenseModal
                    user={user}
                    license={license}
                    projects={projects}
                    companySlug={companySlug}
                    companyId={companyId}
                    onClose={() => setLicenseModalOpen(false)}
                />
            )}
        </>
    );
}
