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
            <BreadcrumbList className="flex items-center gap-2">
                <BreadcrumbItem>
                    <BreadcrumbLink
                        asChild
                        className="text-xs font-medium text-muted-foreground hover:text-brand-primary transition-all flex items-center gap-2"
                    >
                        <Link href="/dashboard">
                            <Home className="h-4 w-4" />
                            Plataforma
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
                            <BreadcrumbSeparator className="text-muted-foreground/40 mx-1" />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="text-sm font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full select-none">
                                        {label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink
                                        asChild
                                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-all px-2"
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
