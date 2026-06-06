import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserBySlug } from '../lib/queries';

export function useUserSidebar() {
  const { user } = useAuth();
  const { data: userDetail } = useUserBySlug(user?.slug ?? '');
  const [openCompanies, setOpenCompanies] = useState<Set<string>>(new Set());

  const companies = userDetail?.companies ?? [];

  useEffect(() => {
    if (companies.length > 0)
      setOpenCompanies(new Set(companies.map((c) => c.id)));
  }, [companies]);

  function toggleCompany(id: string) {
    setOpenCompanies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function scrollToProject(projectId: string) {
    document.getElementById(`project-${projectId}`)?.scrollIntoView({ behavior: 'smooth' });
  }

  return { companies, openCompanies, toggleCompany, scrollToProject };
}
