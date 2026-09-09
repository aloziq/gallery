import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, Check, Filter, Printer } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

interface ProjectItem {
    id: number;
    name: string;
    slug: string;
    gender: 'male' | 'female';
    qr_code: string;
    qr_svg: string;
}

interface PrintQrsProps {
    projects: ProjectItem[];
    currentGender: string;
    counts: {
        male: number;
        female: number;
        all: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'إدارة المشاريع', href: '/projects' },
    { title: 'طباعة رموز QR', href: '/projects/print-qrs' },
];

export default function PrintQrs({ projects, currentGender, counts }: PrintQrsProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleGenderChange = (gender: string) => {
        router.get('/projects/print-qrs', { gender }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="طباعة بطاقات رموز QR للمشاريع — المعرض التقني" />

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    header, aside, nav, [data-sidebar], .sidebar, [data-slot="sidebar"], .no-print {
                        display: none !important;
                    }
                    html, body, main {
                        background: #ffffff !important;
                        color: #000000 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        min-height: auto !important;
                    }
                    .print-container {
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .print-sheet {
                        page-break-after: always !important;
                        break-after: page !important;
                        height: 100vh !important;
                        max-height: 100vh !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        box-sizing: border-box !important;
                        padding: 20mm 10mm !important;
                    }
                    .print-sheet:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }
                    .print-svg-wrapper {
                        width: 100% !important;
                        max-width: 520px !important;
                        margin: 0 auto !important;
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                    }
                    .print-svg-wrapper svg {
                        width: 100% !important;
                        height: auto !important;
                        max-height: 85vh !important;
                    }
                }
            `}</style>

            <div className="flex flex-col font-sans w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16" dir="rtl">
                {/* Screen Control Header */}
                <div className="no-print bg-card border border-border/50 rounded-2xl p-6 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
                                    طباعة بطاقات رموز QR للمشاريع
                                </h1>
                                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5">
                                    {projects.length} مشروع جاهز
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                بطاقات قياسية جاهزة للطباعة الورقية (A4) تحتوي على عنوان المشروع ورمز QR المباشر للتقييم دون أي أرقام هواتف.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start md:self-auto">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/projects" className="gap-1.5">
                                    <ArrowRight className="w-4 h-4" /> العودة لإدارة المشاريع
                                </Link>
                            </Button>
                            <Button onClick={handlePrint} size="sm" className="gap-2 bg-primary text-primary-foreground shadow-sm hover:opacity-95">
                                <Printer className="w-4 h-4" /> طباعة البطاقات الآن
                            </Button>
                        </div>
                    </div>

                    {/* Gender Filter Tabs */}
                    <div className="mt-6 pt-5 border-t border-border/40 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground ml-1" />
                            <span className="text-xs font-semibold text-muted-foreground">التصفية حسب الفئة:</span>
                            <div className="inline-flex rounded-lg border border-border/60 p-1 bg-muted/20">
                                <button
                                    type="button"
                                    onClick={() => handleGenderChange('male')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                        currentGender === 'male'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {currentGender === 'male' && <Check className="w-3.5 h-3.5 text-primary" />}
                                    مشاريع الطلاب (بنين)
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30">
                                        {counts.male}
                                    </Badge>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleGenderChange('female')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                        currentGender === 'female'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {currentGender === 'female' && <Check className="w-3.5 h-3.5 text-primary" />}
                                    مشاريع الطالبات (بنات)
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30">
                                        {counts.female}
                                    </Badge>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleGenderChange('all')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                        currentGender === 'all'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {currentGender === 'all' && <Check className="w-3.5 h-3.5 text-primary" />}
                                    الجميع
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30">
                                        {counts.all}
                                    </Badge>
                                </button>
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground font-mono">
                            {currentGender === 'male' && '✓ تم تفعيل استبعاد مشاريع الطالبات والتركيز على مشاريع البنين'}
                            {currentGender === 'female' && 'عرض مشاريع الطالبات فقط'}
                            {currentGender === 'all' && 'عرض كامل مشاريع المعرض'}
                        </div>
                    </div>
                </div>

                {/* Cards Preview on Screen / Clean Sheets in Print */}
                <div className="print-container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="print-sheet bg-card border border-border/60 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center transition-all hover:border-primary/40"
                        >
                            <div className="no-print w-full flex items-center justify-between text-xs text-muted-foreground mb-4 pb-3 border-b border-border/40">
                                <span className="font-mono font-bold text-foreground">مشروع #{project.id}</span>
                                <Badge variant="secondary" className="text-[10px]">
                                    {project.gender === 'male' ? 'بنين' : 'بنات'}
                                </Badge>
                            </div>

                            <div
                                className="print-svg-wrapper w-full flex justify-center items-center [&>svg]:w-full [&>svg]:max-w-[380px] [&>svg]:h-auto [&>svg]:rounded-xl [&>svg]:border [&>svg]:border-border/40"
                                dangerouslySetInnerHTML={{ __html: project.qr_svg }}
                            />

                            <div className="no-print mt-4 pt-3 w-full border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="truncate max-w-[200px]" title={project.name}>
                                    {project.name}
                                </span>
                                <a
                                    href={`/storage/${project.qr_code}`}
                                    download={`${project.slug}-qr.svg`}
                                    className="text-primary hover:underline font-medium"
                                >
                                    تحميل SVG
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {projects.length === 0 && (
                    <div className="bg-card border border-border/40 rounded-2xl p-12 text-center text-muted-foreground">
                        لا توجد مشاريع مطابقة للفئة المحددة حالياً.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
