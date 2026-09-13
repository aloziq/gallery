import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArrowRight,
    Award,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    Github,
    GraduationCap,
    Loader2,
    MessageSquare,
    Sparkles,
    Star,
    User,
    Users,
} from 'lucide-react';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { ProjectCover } from '@/components/project-cover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProjectMember {
    id: number;
    name: string;
    role?: string | null;
    photo?: string | null;
    pivot?: {
        role?: string | null;
        photo?: string | null;
    };
}

interface Project {
    id: number;
    name: string;
    slug: string;
    category?: string | null;
    department?: string | null;
    gender?: 'male' | 'female' | string | null;
    academic_level?: string | null;
    short_description?: string | null;
    description?: string | null;
    cover_image?: string | null;
    team_name?: string | null;
    technologies?: string | null;
    demo_url?: string | null;
    github_url?: string | null;
    document_url?: string | null;
    evaluations_avg_rating?: string | number | null;
    evaluations_count?: number;
    members?: ProjectMember[];
}

interface ExistingEvaluation {
    rating: number;
    comment?: string | null;
    evaluator_name?: string | null;
}

interface Flash {
    success?: string;
    error?: string;
}

const RATING_LABELS: Record<number, { text: string; color: string }> = {
    1: { text: 'ضعيف (1 / 5)', color: 'text-rose-500' },
    2: { text: 'مقبول (2 / 5)', color: 'text-amber-500' },
    3: { text: 'جيد (3 / 5)', color: 'text-sky-500' },
    4: { text: 'جيد جداً (4 / 5)', color: 'text-indigo-500' },
    5: { text: 'ممتاز وإبداعي (5 / 5)', color: 'text-emerald-500' },
};

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
}

export default function TeacherShow({
    project,
    existingEvaluation,
}: {
    project: Project;
    existingEvaluation: ExistingEvaluation | null;
    visitorToken: string;
}) {
    const [rating, setRating] = useState<number>(existingEvaluation?.rating || 5);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>(existingEvaluation?.comment || '');
    const [evaluatorName, setEvaluatorName] = useState<string>(existingEvaluation?.evaluator_name || '');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

    const { flash } = usePage().props as { flash?: Flash };

    const isEng = !(/[\u0600-\u06FF]/.test(project.name));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating < 1 || rating > 5) return;

        setIsSubmitting(true);
        router.post(
            `/teacher/p/${project.slug}/evaluate`,
            {
                rating,
                comment: comment.trim() || null,
                evaluator_name: evaluatorName.trim() || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmittedSuccess(true);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    const techList = useMemo(() => {
        if (!project.technologies) return [];
        return project.technologies
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }, [project.technologies]);

    const activeRating = hoverRating || rating;

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary pb-24" dir="rtl">
            <Head title={`تحكيم: ${project.name} — بوابة هيئة التدريس`} />

            {/* Navigation Header */}
            <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/70">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between max-w-[1500px]">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/teacher"
                            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-muted/80 hover:bg-muted text-foreground transition-colors border border-border/70"
                        >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>العودة لقائمة المشاريع</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>وزن تصويت المحكم: 3×</span>
                        </div>
                        <AppearanceToggleTab />
                    </div>
                </div>
            </header>

            <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-8 max-w-[1500px]">
                {/* Flash Messages */}
                {(flash?.success || submittedSuccess) && (
                    <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{flash?.success || 'تم حفظ واعتماد تقييمك وملاحظاتك بنجاح بمعدل 3 أضعاف 🎉'}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Right Column: Project Overview & Details */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Cover Image & Quick Info */}
                        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
                            <div className="relative h-64 sm:h-80 bg-muted overflow-hidden">
                                <ProjectCover
                                    src={project.cover_image}
                                    alt={project.name}
                                    category={project.category}
                                    department={project.department}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                                <div className="absolute bottom-6 right-6 left-6 text-white space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap text-xs">
                                        {project.department && (
                                            <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md font-bold uppercase">
                                                {project.department}
                                            </span>
                                        )}
                                        {project.gender && (
                                            <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md font-medium">
                                                {project.gender === 'male' ? 'مشاريع الطلاب (بنين)' : 'مشاريع الطالبات (بنات)'}
                                            </span>
                                        )}
                                        {project.category && (
                                            <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md">
                                                {project.category}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-black font-heading leading-tight drop-shadow-sm">
                                        {project.name}
                                    </h1>
                                    {project.team_name && (
                                        <p className="text-white/80 text-xs font-mono">
                                            فريق العمل: {project.team_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Short description */}
                                {project.short_description && (
                                    <p className="text-sm text-foreground/90 font-medium leading-relaxed bg-muted/30 p-4 rounded-2xl border border-border/50">
                                        {project.short_description}
                                    </p>
                                )}

                                {/* Full description */}
                                {project.description && (
                                    <div className="space-y-2">
                                        <h2 className="text-sm font-bold text-foreground">وصف وتفاصيل المشروع</h2>
                                        <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                                            {project.description}
                                        </div>
                                    </div>
                                )}

                                {/* Technologies */}
                                {techList.length > 0 && (
                                    <div className="space-y-2 pt-4 border-t border-border/50">
                                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            التقنيات والأدوات المستخدمة
                                        </h2>
                                        <div className="flex flex-wrap gap-1.5">
                                            {techList.map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border/60"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Project Links */}
                                {(project.demo_url || project.github_url || project.document_url) && (
                                    <div className="space-y-2 pt-4 border-t border-border/50">
                                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            روابط وملفات المشروع
                                        </h2>
                                        <div className="flex flex-wrap gap-2.5">
                                            {project.demo_url && (
                                                <a
                                                    href={project.demo_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors border border-primary/20"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    <span>رابط العرض الحي (Live Demo)</span>
                                                </a>
                                            )}
                                            {project.github_url && (
                                                <a
                                                    href={project.github_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 text-xs font-semibold transition-colors border border-border"
                                                >
                                                    <Github className="w-3.5 h-3.5" />
                                                    <span>المستودع البرمجي (GitHub)</span>
                                                </a>
                                            )}
                                            {project.document_url && (
                                                <a
                                                    href={project.document_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 text-xs font-semibold transition-colors border border-border"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span>وثيقة المشروع (Documentation)</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Members List */}
                        {project.members && project.members.length > 0 && (
                            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    <h2 className="text-sm font-bold text-foreground">أعضاء الفريق والطلاب المشاركون</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {project.members.map((member) => {
                                        const role = member.pivot?.role || member.role;
                                        const photo = member.pivot?.photo || member.photo;

                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60"
                                            >
                                                {photo ? (
                                                    <img
                                                        src={photo}
                                                        alt={member.name}
                                                        className="w-10 h-10 rounded-xl object-cover border border-border"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                                                        {getInitials(member.name)}
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-bold text-foreground truncate">
                                                        {member.name}
                                                    </div>
                                                    {role && (
                                                        <div className="text-[11px] text-muted-foreground truncate">
                                                            {role}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Left Column: Teacher Evaluation & Comment Form */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 rounded-3xl border border-primary/30 bg-card p-6 shadow-sm space-y-6">
                            {/* Evaluation Header */}
                            <div className="border-b border-border/60 pb-5">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                                        <GraduationCap className="w-4 h-4" />
                                        <span>استمارة تقييم هيئة التدريس</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        الوزن: 3 أضعاف (3×)
                                    </span>
                                </div>
                                <h2 className="text-xl font-black text-foreground font-heading">
                                    تحكيم واعتماد المشروع
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    تقييمك الأكاديمي سيسهم بنسبة مرجحة عالية في الترتيب النهائي للمشروع.
                                </p>
                            </div>

                            {existingEvaluation && (
                                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>
                                        تم تسجيل تقييم سابق لهذا المشروع ({existingEvaluation.rating} من 5). يمكنك تعديل الدرجة أو الملاحظات أدناه.
                                    </span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Evaluator Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                                        <span>اسم الدكتور / المحكم</span>
                                        <span className="text-[10px] text-muted-foreground font-normal">(اختياري)</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={evaluatorName}
                                        onChange={(e) => setEvaluatorName(e.target.value)}
                                        placeholder="د. فلان الفلاني..."
                                        maxLength={100}
                                        className="h-11 rounded-xl bg-background border-border text-sm"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        يساعد لجنة التحكيم والإدارة في معرفة المحكم صاحب التقييم والملاحظات.
                                    </p>
                                </div>

                                {/* Star Rating Selection */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                                        <span>الدرجة والتقييم الأكاديمي</span>
                                        <span className={`text-xs font-bold font-mono ${RATING_LABELS[activeRating]?.color || ''}`}>
                                            {RATING_LABELS[activeRating]?.text}
                                        </span>
                                    </label>

                                    <div className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-muted/40 border border-border/70">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const isFilled = star <= activeRating;
                                            return (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    className="p-1 rounded-xl hover:scale-125 transition-transform duration-200 focus:outline-none"
                                                    title={`${star} نجوم`}
                                                >
                                                    <Star
                                                        className={`w-9 h-9 transition-colors ${
                                                            isFilled
                                                                ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                                                                : 'text-muted-foreground/30 hover:text-amber-300'
                                                        }`}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Comments Textarea */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5 text-primary" />
                                            <span>ملاحظات وتوصيات التحكيم</span>
                                        </label>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            {comment.length} / 1000
                                        </span>
                                    </div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        maxLength={1000}
                                        rows={5}
                                        placeholder="اكتب ملاحظاتك، نقاط القوة، فرص التطوير، أو أي توصية تراها للجنة الإشراف..."
                                        className="w-full rounded-2xl bg-background border border-border p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed resize-none"
                                    />
                                    <div className="rounded-xl bg-muted/50 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
                                        🔒 <strong>ملاحظة هامة:</strong> هذه الملاحظات خاصة ومحفوظة للجنة إدارة المعرض فقط ولن تظهر للزوار على صفحة المشروع العامة.
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || rating === 0}
                                    className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md gap-2 transition-all"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>جارٍ اعتماد التقييم...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Award className="w-4 h-4" />
                                            <span>
                                                {existingEvaluation ? 'تحديث تقييم المشروع (3×)' : 'اعتماد وحفظ التقييم (3×)'}
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
