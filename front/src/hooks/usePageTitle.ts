import {useEffect} from 'react';

export function usePageTitle(title: string) {
    useEffect(() => {
        document.title = title ? `ilipro — ${title}` : 'ilipro';
        return () => {
            document.title = 'ilipro';
        };
    }, [title]);
}
