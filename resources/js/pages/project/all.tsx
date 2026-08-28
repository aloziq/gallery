import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Maximize2, Star } from 'lucide-react';
import AppearanceToggleTab from '@/components/appearance-tabs';

function ProjectCard({ project, idx }: { project: any, idx: number }) {
    const category = project.category || 'مشروع';
    const indexFormatted = String(idx + 1).padStart(2, '0');
    
    // Default to '0.0' or '-' if there are no evaluations
    const avgRating = project.evaluations_avg_rating
        ? Number(project.evaluations_avg_rating).toFixed(1)
        : '0.0';
        
    return (
        <article className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 h-[40vh] min-h-[320px]">
            {/* Image Container */}
            <Link href={`/p/${project.slug}`} className="relative block h-[55%] bg-muted overflow-hidden shrink-0">
                {project.cover_image ? (
                    <img
                        src={`/storage/${project.cover_image}`}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted">
                        <span className="font-mono text-sm opacity-50">لا توجد صورة</span>
                    </div>
                )}
                
                {/* Rating Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full border border-border/50 bg-background/90 px-2 py-1 shadow-sm backdrop-blur-md">
                    <span className="mt-0.5 font-mono text-[10px] leading-none font-bold text-foreground">
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
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2 shrink-0">
                    <span className="text-primary text-[9px] font-bold tracking-wider uppercase">
                        {category}
                    </span>
                    <span className="font-mono text-[10px] font-semibold tracking-wider text-muted-foreground">
                        {indexFormatted}
                    </span>
                </div>
                
                <h3 className="text-lg font-bold text-card-foreground mb-1.5 leading-tight shrink-0">
                    <Link href={`/p/${project.slug}`} className="focus:outline-none hover:text-primary transition-colors line-clamp-2">
                        {project.name}
                    </Link>
                </h3>
                
                <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">
                    {project.short_description}
                </p>
                
                <Link 
                    href={`/p/${project.slug}`}
                    className="inline-flex items-center text-xs font-semibold text-primary group/link mt-auto shrink-0"
                >
                    عرض المشروع
                    <ArrowLeft className="w-3.5 h-3.5 mr-1 transition-transform group-hover/link:-translate-x-1" />
                </Link>
            </div>
        </article>
    );
}

export default function AllProjects({ projects }: { projects: any[] }) {
    const [activeFilter, setActiveFilter] = useState('الكل');
    
    const filters = ['الكل', 'UI\\UX', 'Web Development', 'Desktop Application'];

    const filteredProjects = activeFilter === 'الكل' 
        ? projects 
        : projects.filter(p => p.category === activeFilter);

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary" dir="rtl">
            <Head title="تصفح جميع المشاريع" />

            {/* Navigation */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded border-2 border-primary flex items-center justify-center transition-colors group-hover:bg-primary/10">
                                <div className="w-4 h-4 bg-primary rounded-sm" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">المعرض التقني</span>
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <AppearanceToggleTab />
                    </div>
                </div>
            </header>

            <main className="mx-auto px-6 py-12 md:py-16 w-full max-w-[1600px]">
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12 border-b border-border pb-8 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3 font-heading">
                            جميع المشاريع
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            تصفح {projects.length} مشروعاً مشاركاً في المعرض
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors duration-200 border ${
                                    activeFilter === filter
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        {filteredProjects.map((project, index) => (
                            <ProjectCard key={project.id} project={project} idx={index} />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center border border-dashed border-border rounded-2xl bg-card animate-fade-in-up">
                        <p className="text-muted-foreground font-medium">لا توجد مشاريع ضمن هذا التصنيف.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
