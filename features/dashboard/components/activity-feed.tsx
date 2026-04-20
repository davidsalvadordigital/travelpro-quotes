import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ActivityItem } from "@/lib/dal/stats";

export function ActivityFeed({ initialActivity }: { initialActivity: ActivityItem[] }) {
    return (
        <Card className="lg:col-span-3 border border-border/60 bg-card rounded-2xl shadow-sm relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="pt-8 pb-5 px-8 border-b border-glass-border bg-muted/10">
                <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <Clock className="h-5 w-5 text-brand-primary" strokeWidth={2.5} />
                    Actividad reciente
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-7 px-8 pb-10">
                {initialActivity.length > 0 ? (
                    <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-brand-primary/10">
                        {initialActivity.map((item, i) => (
                            <div key={i} className="relative pl-10 group cursor-pointer">
                                <div className="absolute left-0 top-1 h-[24px] w-[24px] rounded-full bg-background border-2 border-brand-primary/20 flex items-center justify-center group-hover:border-brand-primary transition-all duration-300 z-10 shadow-sm group-hover:shadow-brand-primary/20">
                                    <div className="h-2.5 w-2.5 rounded-full bg-brand-primary/30 group-hover:bg-brand-primary transition-all duration-300" />
                                </div>
                                <div className="rounded-2xl p-3 -ml-3 hover:bg-brand-primary/5 transition-all duration-300 border border-transparent hover:border-brand-primary/10">
                                    <p className="text-sm text-foreground font-bold group-hover:text-brand-primary transition-colors leading-snug">{item.text}</p>
                                    <p className="text-[11px] font-semibold text-muted-foreground/60 mt-1 uppercase tracking-widest">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="rounded-[2rem] bg-muted/20 border border-border/40 p-6">
                            <Inbox className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground">Sin actividad reciente</p>
                            <p className="text-xs font-medium text-muted-foreground/60">No hay operaciones registradas todavía.</p>
                        </div>
                    </div>
                )}
                <Button variant="outline" className="w-full mt-8 h-10 border-dashed border-border/50 rounded-xl hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all text-[10px] font-bold uppercase tracking-widest">
                    Ver historial
                </Button>
            </CardContent>
        </Card>
    );
}