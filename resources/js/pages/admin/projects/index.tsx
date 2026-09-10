import { Head, Link, router } from '@inertiajs/react';
import { Download, Edit2, Loader2, Plus, Printer, QrCode, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'إدارة المشاريع', href: '/projects' },
];

export default function Index({ projects }: { projects: any }) {
    const [votingProject, setVotingProject] = useState<any | null>(null);
    const [voteCount, setVoteCount] = useState<number>(5);
    const [rating, setRating] = useState<number>(5);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const remove = (id: number) =>
        confirm('هل أنت متأكد من حذف هذا المشروع نهائياً؟') && router.delete(`/projects/${id}`);

    const handleVoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!votingProject || voteCount < 1) return;

        setIsSubmitting(true);
        router.post(
            `/projects/${votingProject.id}/add-votes`,
            { votes: voteCount, rating },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setVotingProject(null);
                    setVoteCount(5);
                    setRating(5);
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="إدارة المشاريع — المعرض التقني" />
            <div className="flex flex-col font-sans w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12" dir="rtl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-[28px] font-bold tracking-tight text-foreground font-heading">إدارة المشاريع</h1>
                        <p className="text-[14px] text-secondary-foreground mt-1">سجل المشاريع المشاركة في المعرض والتحكم بحالتها وتقييماتها.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/projects/print-qrs">
                                <Printer className="w-3.5 h-3.5" /> طباعة رموز QR
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/projects/export" target="_blank" rel="noopener noreferrer">
                                <Download className="w-3.5 h-3.5" /> تصدير النتائج
                            </a>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/projects/create">
                                <Plus className="w-3.5 h-3.5" /> إضافة مشروع
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="bg-card rounded-[24px] p-2 sm:p-6 shadow-sm border border-border/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr>
                                    <th className="py-3 px-4">#</th>
                                    <th className="py-3 px-4">المشروع</th>
                                    <th className="py-3 px-4">الفئة</th>
                                    <th className="py-3 px-4">الحالة</th>
                                    <th className="py-3 px-4">التقييمات</th>
                                    <th className="py-3 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.data?.map((project: any) => (
                                    <tr key={project.id} className="border-t border-border/40 hover:bg-muted/30">
                                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{project.id}</td>
                                        <td className="py-3 px-4">
                                            <Link href={`/p/${project.slug}`} className="font-semibold text-primary hover:underline">
                                                {project.name}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">{project.category || '—'}</td>
                                        <td className="py-3 px-4">
                                            {project.is_published ? (
                                                <span className="inline-flex px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">منشور</span>
                                            ) : (
                                                <span className="inline-flex px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">مسودة</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-foreground">{project.evaluations_count}</span>
                                                <span className="text-xs text-muted-foreground">صوت</span>
                                                {Number(project.evaluations_avg_rating) > 0 && (
                                                    <span className="inline-flex items-center gap-0.5 text-xs font-mono font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded mr-1">
                                                        <span>{Number(project.evaluations_avg_rating).toFixed(1)}</span>
                                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => setVotingProject(project)}
                                                    className="h-8 px-2.5 text-xs font-semibold gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                                    title="إضافة أصوات للمشروع"
                                                >
                                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                    <span>تصويت</span>
                                                </Button>

                                                <Link href={`/projects/${project.id}/qr`} title="رمز الاستجابة السريع" className="p-1.5 text-secondary-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                                                    <QrCode className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/projects/${project.id}/edit`} title="تعديل" className="p-1.5 text-secondary-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => remove(project.id)} title="حذف" className="p-1.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Vote Modal Dialog */}
                <Dialog open={!!votingProject} onOpenChange={(open) => !open && setVotingProject(null)}>
                    <DialogContent className="sm:max-w-[440px]" dir="rtl">
                        <form onSubmit={handleVoteSubmit}>
                            <DialogHeader className="text-right">
                                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                                    <span>إضافة أصوات وتقييم للمشروع</span>
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground pt-1">
                                    {votingProject?.name}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-5 py-4">
                                {/* Current Stats Banner */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border/40 text-xs">
                                    <span className="text-muted-foreground">الأصوات الحالية:</span>
                                    <div className="flex items-center gap-2 font-bold">
                                        <span>{votingProject?.evaluations_count || 0} صوت</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 text-amber-500 font-mono">
                                            {Number(votingProject?.evaluations_avg_rating || 0).toFixed(1)} ★
                                        </span>
                                    </div>
                                </div>

                                {/* Vote Presets */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">عدد الأصوات المراد إضافتها:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 5, 10, 25, 50].map((num) => (
                                            <Button
                                                key={num}
                                                type="button"
                                                size="sm"
                                                variant={voteCount === num ? 'default' : 'outline'}
                                                className="h-8 text-xs font-mono"
                                                onClick={() => setVoteCount(num)}
                                            >
                                                +{num}
                                            </Button>
                                        ))}
                                    </div>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={voteCount}
                                        onChange={(e) => setVoteCount(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="mt-2 text-left font-mono"
                                        required
                                    />
                                </div>

                                {/* Rating Selector */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">درجة التقييم (النجوم):</Label>
                                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl border border-border/60 bg-card">
                                        {[5, 4, 3, 2, 1].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                                                    rating === star
                                                        ? 'bg-amber-500 text-white shadow-sm'
                                                        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                <span>{star}</span>
                                                <Star className="w-3 h-3 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setVotingProject(null)}
                                    disabled={isSubmitting}
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || voteCount < 1}
                                    className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>جاري الإضافة...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Star className="w-4 h-4 fill-white" />
                                            <span>إضافة {voteCount} صوت الآن</span>
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}