import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Printer, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QRView({
    project,
    qrSvg,
    url,
}: {
    project: any;
    qrSvg: string;
    url: string;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'المشاريع', href: '/projects' },
        { title: 'رمز QR', href: '#' },
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`بطاقة طاولة المعرض — ${project.name}`} />

            <div
                className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col px-6 py-8 font-sans print:m-0 print:max-w-none print:p-0"
                dir="rtl"
            >
                {/* Screen-only Controls Topbar */}
                <div className="mb-8 flex items-center justify-between border-b border-border/80 pb-6 print:hidden">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-9 gap-1.5 px-3 text-xs text-muted-foreground"
                        >
                            <Link href="/projects">
                                <ArrowRight className="h-3.5 w-3.5" />
                                <span>العودة للمشاريع</span>
                            </Link>
                        </Button>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="font-heading text-xs font-semibold text-foreground">
                            بطاقة طاولة المشروع (QR)
                        </span>
                    </div>
                    <Button
                        onClick={handlePrint}
                        size="sm"
                        className="h-9 gap-1.5 rounded px-4 text-xs font-medium"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        <span>طباعة بطاقة الطاولة (A4/A5)</span>
                    </Button>
                </div>

                {/* The Printable Exhibition Placard (بطاقة الطاولة) */}
                <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-12 print:p-8">
                    <div className="w-full max-w-lg space-y-6 rounded-lg border border-border/80 bg-card p-8 text-center text-card-foreground sm:p-10 print:mx-auto print:w-[85vw] print:max-w-none print:rounded-none print:border-2 print:border-black print:shadow-none">
                        {/* Institutional Header */}
                        <div className="border-b border-border/60 pb-4 print:border-black">
                            <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase print:text-black">
                                المعرض التقني السنوي للمشاريع · كلية الحاسب
                                والمعلومات
                            </p>
                        </div>

                        {/* Project Title & Team */}
                        <div className="space-y-1.5">
                            <span className="font-mono text-xs text-muted-foreground print:text-black">
                                PROJECT #{String(project.id).padStart(2, '0')}
                            </span>
                            <h1 className="font-heading text-2xl leading-tight font-bold text-foreground sm:text-3xl print:text-black">
                                {project.name}
                            </h1>
                            {project.team_name && (
                                <p className="text-sm font-medium text-muted-foreground print:text-black">
                                    فريق العمل: {project.team_name}
                                </p>
                            )}
                        </div>

                        {/* SVG QR Code */}
                        <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-md border border-border/70 bg-white p-4 sm:h-72 sm:w-72 print:border-black">
                            <div
                                className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                                dangerouslySetInnerHTML={{ __html: qrSvg }}
                            />
                        </div>

                        {/* Instruction Footer */}
                        <div className="space-y-1 pt-2">
                            <p className="font-heading text-base font-bold text-foreground print:text-black">
                                امسح الرمز لتقييم المشروع في ثوانٍ
                            </p>
                            <p
                                className="font-mono text-xs text-muted-foreground print:text-black"
                                dir="ltr"
                            >
                                {url}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom print stylesheet */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    header, aside, nav, button { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                    body { background: white !important; color: black !important; }
                }
            `,
                }}
            />
        </AppLayout>
    );
}
