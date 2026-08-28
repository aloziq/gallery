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
                attributionLogo: false,
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
        <div className="min-h-screen w-full flex flex-col justify-center bg-background text-foreground font-sans" dir="rtl">
            <Head title="Live Evaluations Leaderboard" />

            <main className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
                {/* Chart Section - Dominant but minimized slightly */}
                <section className="w-full lg:w-7/12">
                    <div className="mb-6 flex items-center justify-between">
                    </div>

                    <div className="relative h-[500px] w-full" dir="ltr">
                        {/* Chart Mount Point */}
                        <div ref={chartContainerRef} className="absolute inset-0" />
                    </div>
                </section>

                {/* Leaderboard Section - Expanded table view */}
                <section className="w-full lg:w-5/12 flex flex-col">
                    

                    <div className="flex-1 rounded-xl bg-transparent overflow-hidden flex flex-col">
                        {/* <div className="flex items-center gap-4 py-3 px-4 text-xs font-semibold text-muted-foreground border-b border-border/40 bg-transparent">
                            <div className="w-8 text-center shrink-0">الترتيب</div>
                            <div className="flex-1 truncate">المشروع</div>
                            <div className="w-16 text-center shrink-0">النقاط</div>
                            <div className="w-16 text-center shrink-0">المتوسط</div>
                        </div> */}
                        <ul ref={listRef} className="flex flex-col flex-1 overflow-hidden">
                            {topProjects.map((project, index) => {
                                const currentRank = index + 1;
                                const isTop5 = index < 5;
                                const color = isTop5 ? COLORS[index] : 'currentColor';
                                
                                return (
                                    <li
                                        key={project.id}
                                        className="flex items-center gap-4 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="w-8 flex shrink-0 items-center justify-center">
                                            <span className={`text-sm font-bold ${isTop5 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {currentRank}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 truncate flex items-center gap-2">
                                            {isTop5 && (
                                                <div 
                                                    className="h-2 w-2 rounded-full shrink-0" 
                                                    style={{ backgroundColor: color }}
                                                />
                                            )}
                                            <h3 className={`truncate text-sm ${isTop5 ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                                {project.name}
                                            </h3>
                                        </div>

                                        <div className="w-16 flex shrink-0 items-center justify-center">
                                            <span className="font-mono text-sm font-bold text-foreground">
                                                {project.evaluations_count.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="w-16 flex shrink-0 items-center justify-center">
                                            <span className={`text-sm font-medium ${Number(project.evaluations_avg_rating) >= 4.5 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                                {project.evaluations_avg_rating ? Number(project.evaluations_avg_rating).toFixed(1) : '-'}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>
            </main>
        </div>
    );
}
