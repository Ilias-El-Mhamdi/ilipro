import {useEffect} from 'react';
import {useParams, useLocation} from 'react-router-dom';
import {useCompanies, useCompanyProjects} from '../../../lib/queries';
import {AdminLayout} from '../../../components/templates/AdminLayout';
import {BackLink} from '../../../components/atoms/BackLink';
import {CompanyHeader} from './CompanyHeader';
import {UsersSection} from './users/UsersSection.tsx';
import {ProjectsSection} from './project/ProjectsSection.tsx';
import {usePageTitle} from '../../../hooks/usePageTitle';

export function CompanyDetailPage() {
    const {companySlug} = useParams<{ companySlug: string }>();
    const {hash} = useLocation();
    const {data: companies = []} = useCompanies();
    const {data: projects = [], isLoading: projectsLoading} = useCompanyProjects(companySlug!);

    const company = companies.find((c) => c.slug === companySlug);
    usePageTitle(company?.name ?? '');

    useEffect(() => {
        if (!hash || projectsLoading) return;
        const el = document.getElementById(hash.slice(1));
        if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, [hash, projectsLoading, projects]);

    return (
        <AdminLayout>
            <BackLink to="/admin/companies" label="Entreprises"/>
            <CompanyHeader companySlug={companySlug!}/>
            <UsersSection companySlug={companySlug!} companyId={company?.id ?? ''}/>
            <ProjectsSection companySlug={companySlug!}/>
        </AdminLayout>
    );
}
