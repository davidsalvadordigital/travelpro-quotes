"use client";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableSectionItem } from "./sortable-section-item";
import { useActiveQuote, useQuoteActions } from "@/features/quotes/store/quote-store";
import { Label } from "@/components/ui/label";
import { Layout } from "lucide-react";

export function SortableSectionList() {
    const activeQuote = useActiveQuote();
    const { setSectionOrder } = useQuoteActions();
    
    // Fallback if sectionOrder is not defined
    const items = activeQuote.sectionOrder || ["flights", "hotelOptions", "itinerary", "pricing", "terms"];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Requires minimum 5px movement before drag starts, preventing accidental clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.indexOf(active.id as string);
            const newIndex = items.indexOf(over.id as string);
            
            const newOrder = arrayMove(items, oldIndex, newIndex);
            setSectionOrder(newOrder);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] ml-1 text-muted-foreground/60">
                        <Layout className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                        Arquitectura de la Propuesta
                    </Label>
                    <p className="text-sm text-muted-foreground ml-8">
                        Orden de las secciones en el PDF final.
                    </p>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="grid gap-3">
                        {items.map((id) => (
                            <SortableSectionItem key={id} id={id} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
