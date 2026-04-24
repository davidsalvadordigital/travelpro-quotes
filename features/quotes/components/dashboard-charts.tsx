"use client";

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";

// ── Utilidades ────────────────────────────────────────────────────────
const formatChartLabel = (label: string) => {
    if (!label) return "";
    return label.replace(/_/g, ' ');
};

// ── Glass Tooltip Personalizado ───────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number | string; color: string }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl px-5 py-4 shadow-2xl text-[11px] font-bold uppercase tracking-widest animate-in fade-in zoom-in-95 duration-200">
            <p className="text-muted-foreground mb-3 pb-2 border-b border-border/50">{label}</p>
            <div className="space-y-2">
                {payload.map((p: { name: string; value: number | string; color: string }) => {
                    const isLoss = p.name.toLowerCase().includes('pérdida') || p.name.toLowerCase().includes('perdida') || p.name.toLowerCase() === 'perdido';
                    return (
                        <div key={p.name} className="flex items-center justify-between gap-6">
                            <span className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: isLoss ? 'var(--destructive)' : p.color }} />
                                <span className={isLoss ? "text-destructive font-bold" : "text-foreground/80"}>
                                    {formatChartLabel(p.name)}
                                </span>
                            </span>
                            <span className={`tabular-nums ${isLoss ? "text-destructive font-bold" : "text-foreground"}`}>
                                {p.value}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Bar Chart: Rendimiento Ejecutivo ────────────────────────────────
export function AdvisorBarChart({ data }: { data: AdvisorData[] }) {
    if (data.length === 0) {
        return <EmptyChart message="Sin datos de rendimiento disponibles" />;
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barSize={20} barGap={6}>
                <CartesianGrid vertical={false} strokeDasharray="0" stroke="currentColor" strokeOpacity={0.03} />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", opacity: 0.4 }}
                    axisLine={false}
                    tickLine={false}
                    dy={12}
                />
                <YAxis
                    tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", opacity: 0.4 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-8}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.03 }} />
                <Legend
                    formatter={formatChartLabel}
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: 20 }}
                />
                <Bar dataKey="cotizaciones" name="Total" fill="var(--brand-secondary)" radius={[4, 4, 0, 0]} style={{ fill: 'var(--brand-secondary)' }} />
                <Bar dataKey="ganadas" name="Éxito" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} style={{ fill: 'var(--brand-primary)' }} />
                <Bar dataKey="perdidas" name="Pérdidas" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} style={{ fill: 'var(--muted-foreground)' }} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ── Pie Chart: Distribución Estratégica ────────────────────────────────
export function LeadPieChart({ data }: { data: LeadStatusData[] }) {
    if (data.length === 0) {
        return <EmptyChart message="Sin datos de leads disponibles" />;
    }

    // Mapeo de colores ejecutivos para el Pie Chart - Diamond Standard
    const EXECUTIVE_COLORS = [
        "var(--brand-primary)",   // Magenta
        "var(--brand-secondary)", // Cian
        "var(--brand-tertiary)",  // Púrpura
        "var(--muted-foreground)", // Slate Chromatic
    ];

    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => {
                        const color = EXECUTIVE_COLORS[index % EXECUTIVE_COLORS.length];
                        return <Cell key={entry.name} fill={color} style={{ fill: color, outline: 'none' }} />;
                    })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    formatter={formatChartLabel}
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: 0 }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

// ── Area Chart: Tendencia de Cierre ──────────────────────────────────
export function WeeklyLineChart({ data }: { data: WeeklyData[] }) {
    if (data.length === 0) {
        return <EmptyChart message="Sin datos de tendencia disponibles" />;
    }

    return (
        <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorCoti" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-secondary)" style={{ stopColor: 'var(--brand-secondary)' }} stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--brand-secondary)" style={{ stopColor: 'var(--brand-secondary)' }} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGana" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-primary)" style={{ stopColor: 'var(--brand-primary)' }} stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--brand-primary)" style={{ stopColor: 'var(--brand-primary)' }} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="0" stroke="currentColor" strokeOpacity={0.03} />
                <XAxis
                    dataKey="semana"
                    tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", opacity: 0.4 }}
                    axisLine={false}
                    tickLine={false}
                    dy={12}
                />
                <YAxis
                    tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", opacity: 0.4 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-8}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: 20 }}
                />
                <Area
                    type="monotone"
                    dataKey="cotizaciones"
                    name="Volumen"
                    stroke="var(--brand-secondary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCoti)"
                    style={{ stroke: 'var(--brand-secondary)' }}
                />
                <Area
                    type="monotone"
                    dataKey="ganadas"
                    name="Éxito"
                    stroke="var(--brand-primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorGana)"
                    style={{ stroke: 'var(--brand-primary)' }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// ── Types ───────────────────────────────────────────────────────────────
interface AdvisorData {
    name: string;
    cotizaciones: number;
    ganadas: number;
    perdidas: number;
    enProceso: number;
}
interface LeadStatusData {
    name: string;
    value: number;
    color: string;
}
interface WeeklyData {
    semana: string;
    cotizaciones: number;
    ganadas: number;
}
function EmptyChart({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center h-[240px] text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
            {message}
        </div>
    );
}
