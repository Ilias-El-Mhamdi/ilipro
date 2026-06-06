import { useBackVersion } from '../../lib/queries';

const FRONT_VERSION = 'v1.0';

export function VersionBadge() {
    const { data: backVersion } = useBackVersion();

    return (
        <span className="text-gray-600 text-xs font-mono">
            {FRONT_VERSION} / {backVersion ? `v${backVersion.version}` : '…'}
        </span>
    );
}
