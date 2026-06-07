import {useMutation} from '@tanstack/react-query';
import type {License, Project, UserDetail} from '../../../../../lib/queries.ts';
import {api} from '../../../../../lib/api.ts';
import {useCarousel} from '../../../../../hooks/useCarousel.ts';
import {PanelOverview, PanelProjects, PanelMachines} from '../../../../../components/molecules/licensePanel';

const PANELS = ['Général', 'Projets', 'Machines'] as const;

interface Props {
    license: License | null;
    projects: Project[];
    user: UserDetail;
}


export function LicenseCard({license, projects, user}: Props) {
    const {panel, setPanel, prev, next} = useCarousel(PANELS.length);

    const billingPortal = useMutation({
        mutationFn: () =>
            api.post('/stripe/billing-portal', {userId: user.id}).then((r) => r.data as { url: string }),
        onSuccess: ({url}) => window.open(url, '_blank'),
    });

    const initials = (user.firstName[0] ?? '').toUpperCase() + (user.lastName[0] ?? '').toUpperCase();

    return (
        <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-md w-full">
            <CardHeader user={user} initials={initials}/>

            {!license ? (
                <EmptyLicense/>
            ) : (
                <>
                    <div className="h-44 flex flex-col min-h-0">
                        <CarouselNav panel={panel} setPanel={setPanel} prev={prev} next={next}/>
                        <div className="flex-1 px-3 pt-2 pb-3 overflow-y-auto">
                            {panel === 0 && <PanelOverview license={license}/>}
                            {panel === 1 && <PanelProjects license={license} projects={projects}/>}
                            {panel === 2 && <PanelMachines license={license}/>}
                        </div>
                    </div>

                    {user.stripeCustomerId && (
                        <BillingButton onOpen={() => billingPortal.mutate()} isPending={billingPortal.isPending}/>
                    )}
                </>
            )}
        </div>
    );
}

function CardHeader({user, initials}: { user: UserDetail; initials: string }) {
    return (
        <div className="bg-indigo-900/40 border-b border-indigo-800/40 px-3 py-3 flex items-center gap-2.5 shrink-0">
            <div
                className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-sm truncate leading-tight">{user.firstName} {user.lastName}</p>
                <p className="text-indigo-300 text-xs truncate">{user.email}</p>
            </div>
        </div>
    );
}

function EmptyLicense() {
    return (
        <div className="flex flex-col items-center justify-center py-8 gap-1 text-gray-600">
            <span className="text-2xl">—</span>
            <span className="text-xs">Aucune licence</span>
        </div>
    );
}

function CarouselNav({
                         panel,
                         setPanel,
                         prev,
                         next,
                     }: {
    panel: number;
    setPanel: (i: number) => void;
    prev: () => void;
    next: () => void;
}) {
    return (
        <div className="flex items-center justify-between px-3 pt-3 pb-1 shrink-0">
            <button onClick={prev}
                    className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-xs px-1">‹
            </button>
            <div className="flex gap-1">
                {PANELS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPanel(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${i === panel ? 'bg-indigo-400' : 'bg-gray-700'}`}
                    />
                ))}
            </div>
            <button onClick={next}
                    className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer text-xs px-1">›
            </button>
        </div>
    );
}

function BillingButton({onOpen, isPending}: { onOpen: () => void; isPending: boolean }) {
    return (
        <div className="border-t border-gray-800 px-3 py-2 shrink-0">
            <button
                onClick={onOpen}
                disabled={isPending}
                className="w-full text-xs py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
                See billing
            </button>
        </div>
    );
}

