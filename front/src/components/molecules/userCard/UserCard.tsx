import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Client, License, Project } from '../../../lib/queries';
import { LicenseModal } from '../LicenseModal';
import { UserCardHeader } from './UserCardHeader';
import { UserCardCarousel } from './UserCardCarousel';
import { UserCardFooter } from './UserCardFooter';
import { UserCardEditModal } from './UserCardEditModal';
import { useUserCardActions } from '../../../hooks/useUserCardActions';
import { useClipboard } from '../../../hooks/useClipboard';
import { useCarousel } from '../../../hooks/useCarousel';

interface Props {
  client: Client;
  license: License | null;
  projects: Project[];
  companySlug: string;
  companyId: string;
  onDelete: (client: Client) => void;
}

const PANELS_LENGTH = 3;

export function UserCard({ client, license, projects, companySlug, companyId, onDelete }: Props) {
  const navigate = useNavigate();
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const editActions = useUserCardActions(client, companySlug);
  const clipboard = useClipboard();
  const carousel = useCarousel(PANELS_LENGTH);

  return (
    <>
      <div className="group relative flex flex-col bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-md w-full h-72">
        <button
          onClick={() => onDelete(client)}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
        >
          ✕
        </button>
        <UserCardHeader
          client={client}
          onEditClick={editActions.openEditModal}
          onCopyEmail={() => clipboard.copy(client.email)}
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
          onSeeAs={() => navigate(`/admin/users/${client.slug}`)}
        />
      </div>

      {editActions.editModalOpen && (
        <UserCardEditModal
          client={client}
          firstNameDraft={editActions.firstNameDraft}
          onFirstNameChange={editActions.setFirstNameDraft}
          lastNameDraft={editActions.lastNameDraft}
          onLastNameChange={editActions.setLastNameDraft}
          onClose={() => editActions.setEditModalOpen(false)}
          onSubmit={editActions.updateClient.mutate}
          isPending={editActions.updateClient.isPending}
        />
      )}

      {licenseModalOpen && (
        <LicenseModal
          client={client}
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
