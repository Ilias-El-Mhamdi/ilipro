import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useUserBySlug } from '../../../api/users';

export function useUserSidebar() {
  const { userSlug } = useParams<{ userSlug: string }>();
  const { data: userDetail } = useUserBySlug(userSlug ?? '');
  // Companies dépliées par défaut : on ne mémorise que celles repliées explicitement.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const companies = useMemo(() => userDetail?.companies ?? [], [userDetail]);

  const openCompanies = useMemo(
    () => new Set(companies.filter((c) => !collapsed.has(c.id)).map((c) => c.id)),
    [companies, collapsed],
  );

  function toggleCompany(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function scrollToProject(projectId: string) {
    document
      .getElementById(`project-${projectId}`)
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  return { companies, openCompanies, toggleCompany, scrollToProject };
}
