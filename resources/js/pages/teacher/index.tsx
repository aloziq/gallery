import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Award,
    CheckCircle2,
    Clock,
    ExternalLink,
    Filter,
    GraduationCap,
    Layers,
    LogOut,
    RotateCcw,
    Search,
    Star,
    Sparkles,
} from 'lucide-react';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { ProjectCover } from '@/components/project-cover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logout } from '@/routes';

interface Project {
    id: number;
    name: string;
    slug: string;
    category?: string | null;
    department?: string | null;
    gender?: 'male' | 'female' | string | null;
    short_description?: string | null;
    cover_image?: string | null;
    evaluations_avg_rating?: string | number | null;
    evaluations_count?: number;
    team_name?: string | null;
}

const DEPARTMENTS = [
    { id: 'all', label: 'جميع الأقسام' },
    { id: 'IT', label: 'تقنية المعلومات' },
    { id: 'BIT', label: 'نظم معلومات الأعمال' },
    { id: 'Software Engineering', label: 'هندسة البرمجيات' },
    { id: 'Information Systems', label: 'نظم المعلومات' },
    { id: 'Cyber Security', label: 'الأمن السيبراني' },
];

function getDeptBadgeStyle(dept?: string | null) {
    switch (dept) {
        case 'IT':
            return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
        case 'BIT':
            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        case 'Software Engineering':
            return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
        case 'Information Systems':
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        case 'Cyber Security':
            return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

export default function TeacherDashboard({
    projects,
    evaluatedProjectIds = [],
}: {
    projects: Project[];
    evaluatedProjectIds: number[];
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'evaluated' | 'pending'>('all');

    const evaluatedSet = useMemo(() => new Set(evaluatedProjectIds), [evaluatedProjectIds]);

    const evaluatedCount = evaluatedProjectIds.length;
    const pendingCount = Math.max(0, projects.length - evaluatedCount);
    const progressPercent = projects.length > 0 ? Math.round((evaluatedCount / projects.length) * 100) : 0;

    const genderCounts = useMemo(() => ({
        all: projects.length,
        male: projects.filter((p) => p.gender === 'male').length,
        female: projects.filter((p) => p.gender === 'female').length,
    }), [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesDept = selectedDepartment === 'all' || project.department === selectedDepartment;
            const matchesGender = selectedGender === 'all' || project.gender === selectedGender;
            const isEvaluated = evaluatedSet.has(project.id);
            const matchesStatus =
                selectedStatus === 'all' ||
                (selectedStatus === 'evaluated' && isEvaluated) ||
                (selectedStatus === 'pending' && !isEvaluated);

            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                query === '' ||
                project.name.toLowerCase().includes(query) ||
                (project.short_description && project.short_description.toLowerCase().includes(query)) ||
                (project.category && project.category.toLowerCase().includes(query)) ||
                (project.team_name && project.team_name.toLowerCase().includes(query));

            return matchesDept && matchesGender && matchesStatus && matchesSearch;
        });
    }, [projects, selectedDepartment, selectedGender, selectedStatus, searchQuery, evaluatedSet]);

    const isFiltered =
        selectedDepartment !== 'all' ||
        selectedGender !== 'all' ||
        selectedStatus !== 'all' ||
        searchQuery.trim() !== '';

    const resetFilters = () => {
        setSelectedDepartment('all');
        setSelectedGender('all');
        setSelectedStatus('all');
        setSearchQuery('');
    };

    const handleLogout = () => {
        router.post(logout.url());
    };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary pb-24" dir="rtl">
            <Head title="بوابة تقييم هيئة التدريس — المعرض التقني" />

            {/* Sticky Navigation Header */}
            <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/70">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between max-w-[1600px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold tracking-tight font-heading">
                                    بوابة هيئة التدريس والتحكيم
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    وزن الصوت: 3×
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                تقييم مشاريع تخرج وأنشطة المعرض التقني
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/"
                            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>المعرض العام</span>
                        </Link>
                        <AppearanceToggleTab />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1.5 rounded-xl h-9"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">تسجيل الخروج</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-8 max-w-[1600px]">
                {/* Hero / Evaluation Progress Card */}
                <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8 shadow-xs mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                                <Award className="w-3.5 h-3.5" />
                                <span>صلاحية تحكيم أكاديمية</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-heading mb-2">
                                تقييم وتحكيم مشاريع المعرض
                            </h1>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                نرحب بأعضاء هيئة التدريس الكرام. تقييمكم لكل مشروع يحتسب بثلاثة أضعاف (3×) الصوت العادي، بالإضافة لإمكانية تدوين ملاحظات تحكيمية سرية ترفع للجنة المعرض.
                            </p>
                        </div>

                        {/* Progress Stats Box */}
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-background/80 backdrop-blur-xs border border-border/60 p-4 rounded-2xl shrink-0 lg:w-[420px]">
                            <div className="text-center">
                                <div className="text-2xl font-bold font-mono text-foreground">{projects.length}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">إجمالي المشاريع</div>
                            </div>
                            <div className="text-center border-r border-l border-border/50 px-2">
                                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{evaluatedCount}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">تم تقييمها</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{pendingCount}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">بانتظار تقييمك</div>
                            </div>
                            <div className="col-span-3 pt-2">
                                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                                    <span className="text-muted-foreground">نسبة إنجازك للتقييم:</span>
                                    <span className="font-mono font-bold text-primary">{progressPercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 rounded-full"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-card/80 border border-border/70 rounded-3xl p-4 sm:p-5 mb-8 shadow-xs space-y-4">
                    {/* Top Row: Search and Status Segmented Toggle */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث باسم المشروع، الفئة، أو الفريق..."
                                className="pr-10 pl-4 h-11 rounded-2xl bg-background border-border text-sm shadow-xs focus-visible:ring-primary/20"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-mono"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/50 shrink-0">
                            {[
                                { id: 'all', label: 'الكل', count: projects.length },
                                { id: 'pending', label: 'بانتظار التقييم', count: pendingCount, icon: Clock },
                                { id: 'evaluated', label: 'تم تقييمها', count: evaluatedCount, icon: CheckCircle2 },
                            ].map((st) => {
                                const isSelected = selectedStatus === st.id;
                                const Icon = st.icon;
                                return (
                                    <button
                                        key={st.id}
                                        type="button"
                                        onClick={() => setSelectedStatus(st.id as any)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                            isSelected
                                                ? 'bg-background text-foreground shadow-xs border border-border/60'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {Icon && <Icon className="w-3.5 h-3.5" />}
                                        <span>{st.label}</span>
                                        <span className="text-[10px] font-mono opacity-70">({st.count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Middle Row: Gender Filter (Boys / Girls / All) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <span>تصفية الفئات (بنين / بنات):</span>
                        </div>
                        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/50">
                            {[
                                { id: 'all', label: 'جميع المشاريع', count: genderCounts.all },
                                { id: 'male', label: 'مشاريع الطلاب (بنين)', count: genderCounts.male },
                                { id: 'female', label: 'مشاريع الطالبات (بنات)', count: genderCounts.female },
                            ].map((g) => {
                                const isSelected = selectedGender === g.id;
                                return (
                                    <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => setSelectedGender(g.id as any)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                            isSelected
                                                ? 'bg-background text-foreground shadow-xs border border-border/60'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <span>{g.label}</span>
                                        <span className="text-[10px] font-mono opacity-70">({g.count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Row: Department Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0 ml-2">
                            <Filter className="w-3.5 h-3.5 text-primary" />
                            <span>القسم:</span>
                        </div>
                        {DEPARTMENTS.map((dept) => {
                            const isSelected = selectedDepartment === dept.id;
                            return (
                                <button
                                    key={dept.id}
                                    type="button"
                                    onClick={() => setSelectedDepartment(dept.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 border ${
                                        isSelected
                                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                            : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/70'
                                    }`}
                                >
                                    <span>{dept.label}</span>
                                </button>
                            );
                        })}

                        {isFiltered && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="text-xs text-muted-foreground hover:text-foreground shrink-0 h-8 px-2.5 gap-1.5 rounded-xl mr-auto"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>إعادة الضبط</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span>عرض {filteredProjects.length} من أصل {projects.length} مشروعاً</span>
                </div>

                {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProjects.map((project, idx) => {
                            const isEvaluated = evaluatedSet.has(project.id);
                            const avgRating = project.evaluations_avg_rating
                                ? Number(project.evaluations_avg_rating).toFixed(1)
                                : '0.0';

                            return (
                                <div
                                    key={project.id}
                                    className={`group flex flex-col bg-card rounded-2xl overflow-hidden border transition-all duration-300 shadow-xs hover:shadow-md ${
                                        isEvaluated
                                            ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                                            : 'border-border/80 hover:border-primary/40'
                                    }`}
                                >
                                    {/* Cover Image Container */}
                                    <div className="relative h-48 bg-muted overflow-hidden">
                                        <ProjectCover
                                            src={project.cover_image}
                                            alt={project.name}
                                            category={project.category}
                                            department={project.department}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            {isEvaluated ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2.5 py-1 text-[10px] font-bold shadow-sm">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    تم تقييمك
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 text-white px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur-xs">
                                                    <Clock className="w-3 h-3" />
                                                    بانتظار التقييم
                                                </span>
                                            )}
                                        </div>

                                        {/* Average Rating Badge */}
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full border border-border/50 bg-background/90 px-2.5 py-1 shadow-sm backdrop-blur-md">
                                            <span className="font-mono text-[11px] font-bold text-foreground">
                                                {avgRating}
                                            </span>
                                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5 flex flex-col flex-grow">
                                        {/* Badges row */}
                                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                                            {project.department && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getDeptBadgeStyle(project.department)}`}>
                                                    {project.department}
                                                </span>
                                            )}
                                            {project.gender && (
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                                                    project.gender === 'male'
                                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                                        : 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20'
                                                }`}>
                                                    {project.gender === 'male' ? 'طلاب' : 'طالبات'}
                                                </span>
                                            )}
                                            {project.category && (
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {project.category}
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-base font-bold text-foreground mb-1.5 line-clamp-2">
                                            {project.name}
                                        </h3>

                                        {/* Short description */}
                                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-grow leading-relaxed">
                                            {project.short_description || 'مشروع مقدم في المعرض التقني.'}
                                        </p>

                                        {/* Team Name */}
                                        {project.team_name && (
                                            <div className="text-[11px] text-muted-foreground/80 mb-4 font-mono truncate">
                                                الفريق: {project.team_name}
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <Link
                                            href={`/teacher/p/${project.slug}`}
                                            className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                                                isEvaluated
                                                    ? 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                                                    : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs'
                                            }`}
                                        >
                                            {isEvaluated ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    <span>تعديل التقييم والملاحظات</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Award className="w-4 h-4" />
                                                    <span>تقييم المشروع الآن</span>
                                                </>
                                            )}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-card p-8 max-w-lg mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">
                            لا توجد مشاريع مطابقة
                        </h3>
                        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                            لم نجد أي مشروع يطابق خيارات التصفية الحالية.
                        </p>
                        <Button onClick={resetFilters} variant="outline" size="sm" className="rounded-xl gap-2">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>إعادة تعيين الفلاتر</span>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
