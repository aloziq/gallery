import { useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { Layers, Laptop, Smartphone, Cpu, Globe, Database, Shield, Sparkles } from 'lucide-react';

interface ProjectCoverProps {
    src?: string | null;
    alt: string;
    category?: string | null;
    department?: string | null;
    className?: string;
    aspectRatio?: string;
    priority?: boolean;
}

const PALETTES = [
    { bg: 'from-slate-900 via-indigo-950 to-slate-900', accent: '#38bdf8', glow: 'rgba(56, 189, 248, 0.15)', text: 'text-sky-400' },
    { bg: 'from-zinc-900 via-purple-950 to-zinc-900', accent: '#c084fc', glow: 'rgba(192, 132, 252, 0.15)', text: 'text-purple-400' },
    { bg: 'from-stone-900 via-emerald-950 to-stone-900', accent: '#34d399', glow: 'rgba(52, 211, 153, 0.15)', text: 'text-emerald-400' },
    { bg: 'from-slate-950 via-blue-950 to-slate-900', accent: '#60a5fa', glow: 'rgba(96, 165, 250, 0.15)', text: 'text-blue-400' },
    { bg: 'from-neutral-900 via-amber-950 to-neutral-950', accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.15)', text: 'text-amber-400' },
    { bg: 'from-zinc-950 via-rose-950 to-zinc-900', accent: '#fb7185', glow: 'rgba(251, 113, 133, 0.15)', text: 'text-rose-400' },
];

function getCategoryIcon(cat?: string | null) {
    const c = (cat || '').toLowerCase();
    if (c.includes('web') || c.includes('موقع') || c.includes('ويب')) return Globe;
    if (c.includes('mobile') || c.includes('موبايل') || c.includes('تطبيق')) return Smartphone;
    if (c.includes('ai') || c.includes('ذكاء') || c.includes('تنبؤ')) return Sparkles;
    if (c.includes('security') || c.includes('أمن') || c.includes('تشفير')) return Shield;
    if (c.includes('hardware') || c.includes('روبوت') || c.includes('iot')) return Cpu;
    if (c.includes('data') || c.includes('بيانات')) return Database;
    if (c.includes('desktop') || c.includes('نظام')) return Laptop;
    return Layers;
}

export function ProjectCover({
    src,
    alt,
    category,
    department,
    className,
    aspectRatio,
}: ProjectCoverProps) {
    const [hasError, setHasError] = useState(false);
    const patternId = useId();

    // Deterministic palette based on title
    const hash = alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const palette = PALETTES[hash % PALETTES.length];
    const Icon = getCategoryIcon(category);

    const isEng = !(/[\u0600-\u06FF]/.test(alt));

    if (src && !hasError) {
        return (
            <img
                src={src.startsWith('http') || src.startsWith('/') ? src : `/storage/${src}`}
                alt={alt}
                onError={() => setHasError(true)}
                className={cn('w-full h-full object-cover', className)}
            />
        );
    }

    return (
        <div
            className={cn(
                'relative w-full h-full overflow-hidden flex flex-col justify-between p-6 sm:p-8 select-none bg-gradient-to-br',
                palette.bg,
                className
            )}
            style={{ aspectRatio }}
            dir={isEng ? 'ltr' : 'rtl'}
        >
            {/* Background SVG Grid & Mesh */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" fill="none">
                <defs>
                    <pattern id={patternId} width="32" height="32" patternUnits="userSpaceOnUse">
                        <path d="M 32 0 L 0 0 0 32" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>

            {/* Glowing Accent Orbs */}
            <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"
                style={{ backgroundColor: palette.glow }}
            />
            <div
                className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16"
                style={{ backgroundColor: palette.glow }}
            />

            {/* Top Bar: Badge & Icon */}
            <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur-md border border-white/15">
                        <Icon className="w-3.5 h-3.5 text-white/70" />
                        {category || (isEng ? 'Tech Project' : 'مشروع تقني')}
                    </span>
                    {department && (
                        <span className="hidden sm:inline-flex text-[11px] font-medium text-white/60 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                            {department}
                        </span>
                    )}
                </div>

                <span className={cn('text-xs font-mono font-bold tracking-wider uppercase', palette.text)}>
                    EXPO 2026
                </span>
            </div>

            {/* Middle / Bottom Content */}
            <div className="relative z-10 my-auto py-4">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-white tracking-tight leading-snug line-clamp-3 drop-shadow-sm">
                    {alt}
                </h3>
            </div>

            {/* Bottom Footer Accent */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/50">
                <span>{isEng ? 'Annual Tech Exhibition' : 'المعرض السنوي للابتكارات التقنية'}</span>
                <span className="font-mono text-[11px] opacity-70">★ IT Faculty</span>
            </div>
        </div>
    );
}
