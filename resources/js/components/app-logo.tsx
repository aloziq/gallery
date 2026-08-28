import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded bg-foreground text-background">
                <AppLogoIcon className="size-4.5 fill-current" />
            </div>
            <div className="mr-2 grid flex-1 text-right text-xs">
                <span className="truncate font-heading font-bold text-foreground">
                    {name || 'معرض المشاريع'}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                    بوابة الإدارة
                </span>
            </div>
        </>
    );
}
