import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle, ExternalLink, Star, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { evaluate } from '@/routes/project';

type ProjectMember = {
    id: number;
    name: string;
    role: string | null;
};

type Project = {
    name: string;
    slug: string;
    category: string | null;
    department: string | null;
    short_description: string | null;
    description: string | null;
    cover_image: string | null;
    team_name: string | null;
    technologies: string | null;
    demo_url: string | null;
    members: ProjectMember[];
};

type Flash = {
    success?: string;
    error?: string;
};

export default function Show({
    project,
    userRating,
}: {
    project: Project;
    userRating: number | null;
}) {
    const parsedUserRating = userRating !== null ? Number(userRating) : null;
    const [rating, setRating] = useState(parsedUserRating || 1);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { flash } = usePage().props as { flash?: Flash };

    const submitRating = () => {
        if (rating === 0) {
            return;
        }

        setIsSubmitting(true);
        router.post(
            evaluate.url(project.slug),
            { rating },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <div
            className="min-h-screen w-full bg-background pb-16 font-sans text-foreground"
            dir="rtl"
        >
            <Head title={`${project.name} - المعرض التقني`} />
            
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4 sm:px-6 lg:px-8">
                    <Link
                        href={home.url()}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowRight className="size-4" />
                        دليل المعرض
                    </Link>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <section className="mb-16 flex flex-col items-center text-center">
                    <div className="mb-6 flex flex-wrap justify-center items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {project.department || 'المعرض التقني'}
                        </span>
                        {project.category && (
                            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                {project.category}
                            </span>
                        )}
                    </div>
                    <h1 className="font-heading text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl max-w-4xl">
                        {project.name}
                    </h1>
                    {project.short_description && (
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                            {project.short_description}
                        </p>
                    )}
                </section>

                {/* Featured Media */}
                {project.cover_image && (
                    <div className="mb-16 w-full overflow-hidden rounded-3xl border border-border shadow-2xl">
                        <img
                            src={`/storage/${project.cover_image}`}
                            alt={project.name}
                            className="w-full aspect-video md:aspect-[21/9] object-cover"
                        />
                    </div>
                )}

                {/* Split Layout Grid */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                    {/* Main Column */}
                    <div className="space-y-12 lg:col-span-8">
                        {project.description && project.description !== project.short_description && (
                            <section>
                                <h2 className="mb-6 font-heading text-3xl font-bold text-foreground">
                                    عن المشروع
                                </h2>
                                <div className="prose prose-neutral dark:prose-invert max-w-none text-lg leading-loose text-muted-foreground">
                                    <p className="whitespace-pre-line">{project.description}</p>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sticky Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-24 space-y-8 rounded-3xl border border-background/10 bg-foreground/5 p-6 shadow-sm md:p-8">
                            {project.demo_url && (
                                <Button asChild size="lg" className="h-14 w-full text-base font-bold shadow-md transition-transform hover:scale-[1.02]">
                                    <a
                                        href={project.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="size-5" />
                                        فتح العرض الحي
                                    </a>
                                </Button>
                            )}

                            {project.technologies && (
                                <div>
                                    <h3 className="mb-4 font-heading text-lg font-bold text-foreground">التقنيات المستخدمة</h3>
                                    <div className="flex flex-wrap gap-2" dir="ltr">
                                        {project.technologies.split(',').map((tech, i) => (
                                            <span key={i} className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                                                {tech.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {project.members.length > 0 && (
                                <div className="pt-2">
                                    <h3 className="mb-4 font-heading text-lg font-bold text-foreground">
                                        فريق العمل {project.team_name ? `(${project.team_name})` : ''}
                                    </h3>
                                    <ul className="space-y-4">
                                        {project.members.map((member) => (
                                            <li key={member.id} className="flex flex-col">
                                                <span className="text-sm font-semibold text-foreground">{member.name}</span>
                                                {member.role && (
                                                    <span className="text-xs text-muted-foreground">{member.role}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>

                {/* Review Anchor */}
                <section className="mt-24 border-t border-border/70 pt-16" aria-labelledby="rating-title">
                    <div className="mx-auto max-w-3xl">
                        {flash?.success ? (
                            <CompletionState title={flash.success} />
                        ) : flash?.error ? (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center text-sm font-medium text-destructive">
                                {flash.error}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-background/10 bg-foreground p-8 text-center text-background shadow-2xl md:p-12">
                                <h2
                                    id="rating-title"
                                    className="font-heading text-3xl font-bold text-background"
                                >
                                    قيّم هذا المشروع 
                                </h2>
                                
                                <div
                                    className="mt-10 flex justify-center gap-3"
                                    dir="ltr"
                                >
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const isFilled =
                                            hoverRating >= star ||
                                            (!hoverRating && rating >= star);

                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() =>
                                                    setHoverRating(star)
                                                }
                                                onMouseLeave={() =>
                                                    setHoverRating(0)
                                                }
                                                className="rounded-full p-2 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:outline-none active:scale-95"
                                                aria-label={`تقييم ${star} من 5`}
                                            >
                                                <Star
                                                    className={cn(
                                                        'size-10 transition-colors sm:size-14',
                                                        isFilled
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-background/20',
                                                    )}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                                <Button
                                    size="lg"
                                    onClick={submitRating}
                                    disabled={rating === 0 || isSubmitting || (parsedUserRating !== null && rating === parsedUserRating)}
                                    className="mt-10 h-14 w-full sm:w-72 bg-background text-base font-bold text-foreground hover:bg-background/90"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="size-5 animate-spin text-foreground" />
                                    ) : parsedUserRating ? (
                                        'تحديث التقييم'
                                    ) : (
                                        'إرسال التقييم'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

function CompletionState({ title }: { title: string }) {
    return (
        <div className="rounded-2xl border border-background/10 bg-foreground p-8 text-center text-background shadow-2xl">
            <CheckCircle className="mx-auto size-12 text-background/90" />
            
            <p className="mt-2 text-sm leading-6 text-background/70">
                شكراً لك.
            </p>
            <Button asChild variant="outline" className="mt-6 border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background">
                <Link href={home.url()}>العودة إلى الرئيسية</Link>
            </Button>
        </div>
    );
}
