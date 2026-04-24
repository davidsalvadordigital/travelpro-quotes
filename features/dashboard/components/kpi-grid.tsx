import { Card, CardContent } from "@/components/ui/card";
import {
    FileText, TrendingUp, Users, Clock, Calendar,
    ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type DashboardKpi } from "@/lib/dal/stats";

const ICONS = [Users, FileText, TrendingUp, Clock];

export function KpiGrid({ initialStats }: { initialStats: DashboardKpi[] }) {
    return (
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 stagger-enter">
            {initialStats.map((stat, idx) => {
                const Icon = ICONS[idx] ?? Users;
                const TrendIcon = stat.trend === "up" ? ArrowUpRight : stat.trend === "down" ? ArrowDownRight : Minus;
                const isPositive = stat.trend === "up";
                const isNegative = stat.trend === "down";

                return (
                    <Card key={stat.label} variant="glass" className="overflow-hidden border border-border/60 hover:border-brand-primary/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group animate-scale-in">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition-all duration-500 group-hover:bg-brand-primary group-hover:text-white shadow-lg shadow-brand-primary/10 group-hover:shadow-brand-primary/30">
                                    <Icon className="h-7 w-7" strokeWidth={2.5} />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-2xl shadow-inner transition-all duration-300",
                                    isPositive ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" :
                                        isNegative ? "text-rose-600 bg-rose-500/10 dark:text-rose-400" : "text-muted-foreground bg-muted/40"
                                )}>
                                    <TrendIcon className="h-4 w-4" strokeWidth={3} />
                                    {isPositive ? "↑" : isNegative ? "↓" : "—"} 
                                </div>
                            </div>
                            <p className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-[0.25em] mb-2">{stat.label}</p>
                            <h3 className="text-3xl font-extrabold text-foreground tabular-nums tracking-tighter">
                                {stat.value}
                            </h3>
                            <div className="mt-5 flex items-center gap-2.5 border-t border-glass-border/40 pt-5">
                                <div className="p-1.5 bg-muted/20 rounded-lg">
                                    <Calendar className="h-3.5 w-3.5 text-brand-primary/60" />
                                </div>
                                <span className="text-[11px] font-bold text-muted-foreground/50 tracking-tight leading-none">{stat.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
