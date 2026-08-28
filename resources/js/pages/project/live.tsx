import { useEffect, useRef } from 'react';
import { usePoll, Head, Link } from '@inertiajs/react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineSeries, Time } from 'lightweight-charts';
import { ArrowRight, Trophy } from 'lucide-react';
import { home } from '@/routes';

interface Project {
    id: number;
    name: string;
    slug: string;
    department?: string;
    category?: string;
    cover_image?: string;
    display_order: number;
    evaluations_count: number;
    [key: string]: any;
}

interface Props {
    topProjects: Project[];
    chartData: Record<number, { time: Time; value: number }[]>;
}

// 1 Dominant series + 4 secondary (Dominant is bright orange, others are muted but distinct)
const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];
const LINE_WIDTHS = [3, 1, 1, 1, 1] as const;

export default function LiveDashboard({ topProjects, chartData }: Props) {
    // Poll the backend every 1 second for ultra-fresh data
    usePoll(1000);

    const [listRef] = useAutoAnimate();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRefs = useRef<Record<number, ISeriesApi<"Line">>>({});
    
    // Initialize Lightweight Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Auto-detect dark mode for initial grid/text colors. 
        // Tailwind handles the rest of the HTML UI via bg-background / text-foreground
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#a3a3a3' : '#525252'; 
        const gridColor = isDark ? '#ffffff0a' : '#0000000a';

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor,
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 12, // Provides breathing room on the right edge
            },
            crosshair: {
                mode: 1, 
            },
        });
        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Update series data when props change from polling
    useEffect(() => {
        if (!chartRef.current) return;
        
        topProjects.slice(0, 5).forEach((project, index) => {
            if (!seriesRefs.current[project.id]) {
                seriesRefs.current[project.id] = chartRef.current!.addSeries(LineSeries, {
                    color: COLORS[index],
                    lineWidth: LINE_WIDTHS[index],
                    crosshairMarkerRadius: LINE_WIDTHS[index] === 3 ? 6 : 4,
                    lineType: 1, // LineType.WithSteps for a 90-degree step chart
                });
            }
            
            // Set the new data array (Lightweight Charts handles this extremely fast)
            if (chartData[project.id]) {
                seriesRefs.current[project.id].setData(chartData[project.id]);
            }
        });
    }, [chartData, topProjects]);

    return (
        <div className="min-h-screen w-full bg-background text-foreground font-sans" dir="rtl">
            <Head title="Live Evaluations Leaderboard" />

            <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowRight className="size-4" />
                        العودة للمعرض
                    </Link>

                    {/* Time-Range Controls */}
                    <div className="flex items-center gap-1 rounded-md bg-muted/50 p-1" dir="ltr">
                        {['1m', '15m', '1H', '12H', '1D', '7D', 'All'].map((rangeOption) => {
                            // Extract current range from URL manually since it's not a prop
                            const currentRange = new URLSearchParams(window.location.search).get('range') || '15m';
                            const isActive = currentRange === rangeOption;
                            return (
                                <Link
                                    key={rangeOption}
                                    href={`/live?range=${rangeOption}`}
                                    preserveScroll
                                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                                        isActive
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                    }`}
                                >
                                    {rangeOption}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
                {/* Chart Section - Lots of breathing room, no surrounding cards */}
                <section className="flex-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">
                            التقييمات المباشرة
                        </h1>
                        <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500"></span>
                        </span>
                    </div>

                    <div className="relative h-[500px] w-full" dir="ltr">
                        {/* Chart Mount Point */}
                        <div ref={chartContainerRef} className="absolute inset-0" />
                    </div>
                </section>

                {/* Leaderboard Section - Stripped down flat list */}
                <section className="w-full lg:w-80">
                    <div className="mb-6 flex items-center gap-3">
                        <Trophy className="size-5 text-yellow-500" />
                        <h2 className="text-lg font-bold tracking-tight">
                            أفضل 10 مشاريع
                        </h2>
                    </div>

                    <ul ref={listRef} className="flex flex-col gap-1">
                        {topProjects.map((project, index) => {
                            const isTop5 = index < 5;
                            const color = isTop5 ? COLORS[index] : 'currentColor';
                            
                            return (
                                <li
                                    key={project.id}
                                    className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0"
                                >
                                    <div 
                                        className="flex shrink-0 items-center justify-center text-xs font-bold w-6"
                                        style={{ 
                                            color: isTop5 ? color : 'var(--muted-foreground)',
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 truncate">
                                        <h3 className={`truncate ${isTop5 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                            {project.name}
                                        </h3>
                                    </div>
                                    <div className="flex shrink-0 items-center">
                                        <span className="font-mono text-sm font-bold text-foreground">
                                            {project.evaluations_count.toLocaleString()}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </main>
        </div>
    );
}
