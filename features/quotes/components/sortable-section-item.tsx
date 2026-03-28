"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plane, Hotel, Calendar, CreditCard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableSectionItemProps {
    id: string;
}

const getSectionIcon = (id: string) => {
    switch (id) {
        case "flights": return <Plane className="h-5 w-5" />;
        case "hotelOptions": return <Hotel className="h-5 w-5" />;
        case "itinerary": return <Calendar className="h-5 w-5" />;
        case "pricing": return <CreditCard className="h-5 w-5" />;
        case "terms": return <FileText className="h-5 w-5" />;
        default: return <FileText className="h-5 w-5" />;
    }
};

const getSectionLabel = (id: string) => {
    switch (id) {
        case "flights": return "Vuelos y Rutas";
        case "hotelOptions": return "Opciones de Hospedaje";
        case "itinerary": return "Itinerario Detallado";
        case "pricing": return "Inversión y Presupuesto";
        case "terms": return "Términos y Condiciones";
        default: return id;
    }
};

export function SortableSectionItem({ id }: SortableSectionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300",
                "border-glass-border bg-background/50 hover:border-brand-primary/30 hover:bg-brand-primary/[0.02]",
                isDragging ? "opacity-50 border-brand-primary z-50 shadow-xl" : "shadow-sm"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="p-2 rounded-xl hover:bg-muted transition-colors cursor-grab active:cursor-grabbing"
                title="Reordenar sección"
            >
                <GripVertical className="h-5 w-5 text-muted-foreground/70" />
            </div>

            <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                "bg-brand-primary/10 text-brand-primary"
            )}>
                {getSectionIcon(id)}
            </div>

            <div className="flex-1">
                <span className="text-sm font-bold tracking-tight text-foreground">
                    {getSectionLabel(id)}
                </span>
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/40 mt-0.5">
                    Sección de Cotización
                </p>
            </div>
        </div>
    );
}
