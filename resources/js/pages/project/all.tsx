import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Filter, Layers, Maximize2, RotateCcw, Search, Star } from 'lucide-react';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { ProjectCover } from '@/components/project-cover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Project {
    id: number;
    name: string;
    slug: string;
    category?: string | null;
    department?: string | null;
    short_description?: string | null;
    cover_image?: string | null;
    gender?: 'male' | 'female' | string | null;
    evaluations_avg_rating?: string | number | null;
    evaluations_count?: number;
    team_name?: string | null;
}

const DEPARTMENTS = [
    { id: 'all', label: 'جميع الأقسام', labelEn: 'All Sections', short: 'الكل' },
    { id: 'IT', label: 'تقنية المعلومات', labelEn: 'IT', short: 'IT' },
    { id: 'BIT', label: 'نظم معلومات الأعمال', labelEn: 'BIT', short: 'BIT' },
    { id: 'Software Engineering', label: 'هندسة البرمجيات', labelEn: 'Software Eng.', short: 'SE' },
    { id: 'Information Systems', label: 'نظم المعلومات', labelEn: 'Info. Systems', short: 'IS' },
    { id: 'Cyber Security', label: 'الأمن السيبراني', labelEn: 'Cyber Security', short: 'Cyber' },
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

function ProjectCard({ project, idx }: { project: Project; idx: number }) {
    const category = project.category || 'مشروع';
    const indexFormatted = String(idx + 1).padStart(2, '0');
    const isEng = !(/[\u0600-\u06FF]/.test(project.name));

    const avgRating = project.evaluations_avg_rating
        ? Number(project.evaluations_avg_rating).toFixed(1)
        : '0.0';

    return (
        <article className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 h-[430px]">
            {/* Image / Cover Container */}
            <Link href={`/p/${project.slug}`} className="relative block h-[50%] bg-muted overflow-hidden shrink-0">
                <ProjectCover
                    src={project.cover_image}
                    alt={project.name}
                    category={project.category}
                    department={project.department}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Rating Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full border border-border/50 bg-background/90 px-2 py-1 shadow-sm backdrop-blur-md">
                    <span className="mt-0.5 font-mono text-[11px] leading-none font-bold text-foreground">
                        {avgRating}
                    </span>
                    <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                </div>

                {/* Expand Icon */}
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background text-foreground">
                    <Maximize2 className="w-3.5 h-3.5" />
                </div>
            </Link>

            {/* Content Container */}
            <div className="p-5 flex flex-col flex-grow text-right" dir={isEng ? 'ltr' : 'rtl'}>
                {/* Meta Top: Department & Number */}
                <div className="flex items-center justify-between gap-2 mb-2.5 shrink-0">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        {project.department && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wider uppercase truncate ${getDeptBadgeStyle(project.department)}`}>
                                {project.department}
                            </span>
                        )}
                        {project.gender && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border truncate ${
                                project.gender === 'male'
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                    : 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20'
                            }`}>
                                {project.gender === 'male' ? 'طلاب' : 'طالبات'}
                            </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-medium truncate">
                            {category}
                        </span>
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-muted-foreground/80 shrink-0">
                        #{indexFormatted}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-card-foreground mb-2 leading-snug shrink-0">
                    <Link
                        href={`/p/${project.slug}`}
                        className="focus:outline-none hover:text-primary transition-colors line-clamp-2"
                        title={project.name}
                    >
                        {project.name}
                    </Link>
                </h3>

                {/* Short Description */}
                <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">
                    {project.short_description || 'مشروع مقدم في المعرض التقني والابتكارات.'}
                </p>

                {/* Footer Link */}
                <div className="pt-3 border-t border-border/40 mt-auto flex items-center justify-between shrink-0">
                    <Link
                        href={`/p/${project.slug}`}
                        className="inline-flex items-center text-xs font-semibold text-primary group/link gap-1 hover:underline"
                    >
                        <span>{isEng ? 'View Project' : 'عرض المشروع'}</span>
                        {isEng ? (
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                        ) : (
                            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover/link:-translate-x-1" />
                        )}
                    </Link>

                    {project.team_name && (
                        <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[120px]">
                            {project.team_name}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function AllProjects({ projects }: { projects: Project[] }) {
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Compute counts per department dynamically
    const departmentCounts = useMemo(() => {
        const counts: Record<string, number> = { all: projects.length };
        DEPARTMENTS.forEach((dept) => {
            if (dept.id !== 'all') {
                counts[dept.id] = projects.filter((p) => p.department === dept.id).length;
            }
        });
        return counts;
    }, [projects]);

    // Compute counts per gender dynamically
    const genderCounts = useMemo(() => {
        return {
            all: projects.length,
            male: projects.filter((p) => p.gender === 'male').length,
            female: projects.filter((p) => p.gender === 'female').length,
        };
    }, [projects]);

    // Filter projects by department, gender, and search term
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            // 1. Department match
            const matchesDept =
                selectedDepartment === 'all' || project.department === selectedDepartment;

            // 2. Gender match
            const matchesGender =
                selectedGender === 'all' || project.gender === selectedGender;

            // 3. Search query match
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                query === '' ||
                project.name.toLowerCase().includes(query) ||
                (project.short_description && project.short_description.toLowerCase().includes(query)) ||
                (project.category && project.category.toLowerCase().includes(query)) ||
                (project.team_name && project.team_name.toLowerCase().includes(query));

            return matchesDept && matchesGender && matchesSearch;
        });
    }, [projects, selectedDepartment, selectedGender, searchQuery]);

    const isFiltered = selectedDepartment !== 'all' || selectedGender !== 'all' || searchQuery.trim() !== '';

    const resetFilters = () => {
        setSelectedDepartment('all');
        setSelectedGender('all');
        setSearchQuery('');
    };

    return (
        <div
            className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary pb-20"
            dir="rtl"
        >
            <Head title="تصفح جميع المشاريع — حسب التخصص والقسم" />

            {/* Navigation Bar */}
            <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/80">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between max-w-[1600px]">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                                <Layers className="w-4.5 h-4.5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base font-bold tracking-tight font-heading leading-none">
                                    معرض المشاريع
                                </span>
                                <span className="text-[11px] text-muted-foreground mt-0.5">
                                    كلية الحاسوب وتكنولوجيا المعلومات
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <AppearanceToggleTab />
                    </div>
                </div>
            </header>

            <main className="mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 w-full max-w-[1600px]">
                {/* Page Hero Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2.5">
                            <span>دليل المشاريع الشامل</span>
                            <span>·</span>
                            <span>{projects.length} مشروعاً مشاركاً</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground font-heading">
                            تصفح المشاريع حسب التخصص والأقسام
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
                            استكشف الحلول البرمجية والأنظمة الذكية المطورة من قِبل طلاب مختلف أقسام وتخصصات كلية الحاسوب.
                        </p>
                    </div>

                    {/* Search Input Field */}
                    <div className="relative w-full md:w-80 shrink-0">
                        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث بالاسم، الفئة، أو الفريق..."
                            className="pr-10 pl-4 h-11 rounded-xl bg-card border-border/80 text-sm shadow-xs focus-visible:ring-primary/20"
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
                </div>

                {/* Filter Navigation Bar (Clean, Uncrowded Segmented Pills) */}
                <div className="bg-card/70 border border-border/60 rounded-2xl p-3 mb-8 shadow-xs backdrop-blur-xs space-y-3">
                    {/* Gender Segmented Filter */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-border/40">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <span>عرض المشاريع حسب:</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50">
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
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            isSelected
                                                ? 'bg-background text-foreground shadow-xs font-bold border border-border/60'
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

                    <div className="flex items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-semibold">
                            <Filter className="w-3.5 h-3.5 text-primary" />
                            <span>الأقسام والتخصصات الأكاديمية:</span>
                        </div>
                        <span className="font-mono text-[11px]">
                            عرض {filteredProjects.length} من أصل {projects.length}
                        </span>
                    </div>

                    {/* Horizontal Scrollable Pills without Crowding */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
                        {DEPARTMENTS.map((dept) => {
                            const isSelected = selectedDepartment === dept.id;
                            const count = departmentCounts[dept.id] ?? 0;

                            return (
                                <button
                                    key={dept.id}
                                    type="button"
                                    onClick={() => setSelectedDepartment(dept.id)}
                                    className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border select-none ${
                                        isSelected
                                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                            : 'bg-background hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/70'
                                    }`}
                                >
                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                    <span>{dept.label}</span>
                                    <span
                                        className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                                            isSelected
                                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                                : 'bg-muted text-muted-foreground group-hover:bg-background'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}

                        {isFiltered && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="text-xs text-muted-foreground hover:text-foreground shrink-0 h-9 px-3 gap-1.5 rounded-xl ml-auto"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>إعادة الضبط</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Project Grid */}
                {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
                        {filteredProjects.map((project, index) => (
                            <ProjectCard key={project.id} project={project} idx={index} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-card p-8 animate-fade-in-up max-w-lg mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">
                            لا توجد مشاريع مطابقة
                        </h3>
                        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                            لم نجد أي مشروع يطابق التخصص أو عبارة البحث المحددة حالياً.
                        </p>
                        <Button onClick={resetFilters} variant="outline" size="sm" className="rounded-xl gap-2">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>عرض جميع المشاريع ({projects.length})</span>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
