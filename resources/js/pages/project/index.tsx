import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, LayoutGrid, Maximize2, Star } from 'lucide-react';

import { ProjectCover } from '@/components/project-cover';

function ProjectCard({ project, rank, layoutClasses }: { project: any, rank: number, layoutClasses: string }) {
    const category = project.category || 'مشروع';
    
    // Default to '0.0' or '-' if there are no evaluations
    const avgRating = project.evaluations_avg_rating
        ? Number(project.evaluations_avg_rating).toFixed(1)
        : '0.0';
        
    return (
        <article className={`group relative flex flex-col transition-all duration-500 ease-out shrink-0 ${layoutClasses}`}>
            {/* Big blurred number behind/on the edge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14rem] md:text-[20rem] font-black text-foreground/10 blur-xl -z-10 select-none pointer-events-none group-hover:text-foreground/20 transition-colors duration-500">
                {rank}
            </div>

            {/* Content Container */}
            <div className="flex flex-col h-full w-full bg-card rounded-2xl overflow-hidden border border-border shadow-xl">
                {/* Image Container */}
                <Link href={`/p/${project.slug}`} className="relative block h-[55%] bg-muted overflow-hidden shrink-0">
                    <ProjectCover
                        src={project.cover_image}
                        alt={project.name}
                        category={project.category}
                        department={project.department}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Rating Badge */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full border border-border/50 bg-background/90 px-2 py-0.5 shadow-sm backdrop-blur-md">
                        <span className="mt-0.5 font-mono text-[10px] leading-none font-bold text-foreground">
                            {avgRating}
                        </span>
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                    </div>

                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-foreground hidden md:block">
                        <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                </Link>

                <div className="p-4 md:p-5 flex flex-col flex-grow">
                    <span className="text-primary text-[9px] font-bold tracking-wider uppercase mb-1 shrink-0">
                        {category}
                    </span>
                    
                    <h3 className="text-sm md:text-base font-bold text-card-foreground mb-1.5 leading-tight shrink-0 line-clamp-2">
                        <Link href={`/p/${project.slug}`} className="focus:outline-none hover:text-primary transition-colors">
                            {project.name}
                        </Link>
                    </h3>
                    
                    <p className="text-muted-foreground text-[10px] md:text-xs leading-relaxed mb-3 line-clamp-2 flex-grow">
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
            </div>
        </article>
    );
}

export default function Index({ projects }: { projects: any[] }) {
    // Non-overlapping cascading row layout on desktop, stacked correctly on mobile using order classes
    const podiumMap = [
        { project: projects[4], rank: 5, classes: 'order-5 md:order-1 w-full max-w-[320px] md:max-w-none md:w-[200px] lg:w-[240px] h-[360px] md:h-[340px] opacity-100 md:opacity-50 md:hover:opacity-100 hover:scale-105 hover:z-50' },
        { project: projects[2], rank: 3, classes: 'order-3 md:order-2 w-full max-w-[320px] md:max-w-none md:w-[240px] lg:w-[280px] h-[380px] md:h-[400px] opacity-100 md:opacity-70 md:hover:opacity-100 hover:scale-105 hover:z-50' },
        { project: projects[0], rank: 1, classes: 'order-1 md:order-3 w-full max-w-[320px] md:max-w-none md:w-[280px] lg:w-[340px] h-[400px] md:h-[480px] opacity-100 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] hover:scale-105 z-40' },
        { project: projects[1], rank: 2, classes: 'order-2 md:order-4 w-full max-w-[320px] md:max-w-none md:w-[240px] lg:w-[280px] h-[380px] md:h-[400px] opacity-100 md:opacity-70 md:hover:opacity-100 hover:scale-105 hover:z-50' },
        { project: projects[3], rank: 4, classes: 'order-4 md:order-5 w-full max-w-[320px] md:max-w-none md:w-[200px] lg:w-[240px] h-[360px] md:h-[340px] opacity-100 md:opacity-50 md:hover:opacity-100 hover:scale-105 hover:z-50' },
    ].filter(item => item.project !== undefined);

    return (
        <div className="min-h-screen md:h-screen w-full overflow-x-hidden md:overflow-hidden bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary relative flex flex-col items-center justify-center py-20 md:py-0" dir="rtl">
            <Head title="معرض المشاريع" />

            {/* Top Right Tooltip to All Projects */}
            <div className="absolute top-6 right-6 z-[100] fixed md:absolute">
                <div className="group relative inline-flex">
                    <Link 
                        href="/all" 
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </Link>
                    {/* Tooltip Content */}
                    <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 w-[140px] hidden md:block">
                        <div className="bg-foreground text-background text-xs font-semibold px-3 py-2 rounded-md text-center shadow-lg relative">
                            تصفح كل المشاريع
                            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-foreground"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ambient Background Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-primary/5 rounded-full blur-3xl -z-20 pointer-events-none fixed md:absolute"></div>

            <main className="w-full px-4 flex flex-col items-center justify-center h-full">
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center justify-center gap-4 mb-10 md:mb-14 animate-fade-in-up mt-8 md:mt-0">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-[11px] tracking-widest uppercase mb-1">
                        <Star className="w-3 h-3 fill-primary" />
                        أفضل المشاريع
                        <Star className="w-3 h-3 fill-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-3 font-heading drop-shadow-sm">
                        اختيار الجمهور
                    </h1>
                </div>

                {/* Cascading Row Grid (Stack vertically on Mobile) */}
                {podiumMap.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-3 lg:gap-5 w-full max-w-7xl mx-auto overflow-visible animate-fade-in-up pb-12 md:pb-0" style={{ animationDelay: '150ms' }}>
                        {podiumMap.map((item) => (
                            <ProjectCard 
                                key={item.project.id} 
                                project={item.project} 
                                rank={item.rank} 
                                layoutClasses={item.classes} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center border border-dashed border-border rounded-2xl bg-card w-full max-w-lg mx-auto">
                        <p className="text-muted-foreground font-medium">لا توجد مشاريع حالياً.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

