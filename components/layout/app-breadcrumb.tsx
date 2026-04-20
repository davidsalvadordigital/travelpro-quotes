"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

/** Mapa de segmentos de URL a etiquetas en español corporativo */
const ROUTE_LABELS: Record<string, string> = {
    dashboard: "Panel de Control",
    cotizar: "Generador de Oferta",
    admin: "Análisis de Datos",
    profile: "Configuración de Cuenta",
    leads: "Gestión de Prospectos",
    quotes: "Historial de Cotizaciones",
    settings: "Preferencias del Sistema",
};

function formatSegment(segment: string): string {
    return ROUTE_LABELS[segment] ?? (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));
}

export function AppBreadcrumb() {
    const pathname = usePathname();

    if (!pathname || pathname === "/" || pathname === "/dashboard") return null;

    const paths = pathname.split("/").filter((path) => path);

    return (
        <Breadcrumb className="mb-10">
            <BreadcrumbList className="flex items-center gap-1">
                <BreadcrumbItem>
                    <BreadcrumbLink
                        asChild
                        className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 hover:text-brand-primary transition-all flex items-center gap-2"
                    >
                        <Link href="/dashboard">
                            <Home className="h-3 w-3" />
                            PLATAFORMA
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {paths.map((path, index) => {
                    if (path === "dashboard") return null;
                    
                    const href = `/${paths.slice(0, index + 1).join("/")}`;
                    const isLast = index === paths.length - 1;
                    const label = formatSegment(path);

                    return (
                        <Fragment key={path}>
                            <BreadcrumbSeparator className="text-muted-foreground/10 mx-1">
                                <span className="scale-75 text-[8px] font-thin">/</span>
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary bg-brand-primary/5 px-4 py-1.5 rounded-full border border-brand-primary/10 select-none">
                                        {label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink
                                        asChild
                                        className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 hover:text-foreground transition-all px-2"
                                    >
                                        <Link href={href}>{label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
