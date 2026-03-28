import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface EditQuotePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditQuotePage({ params }: EditQuotePageProps) {
    const { id } = await params;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Editar Cotización</h1>
                <p className="text-sm text-muted-foreground">
                    Modificando la cotización ID: <span className="font-mono text-primary">{id}</span>
                </p>
            </div>
            <Card className="flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Editor de Cotización</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                    La edición funcional de cotizaciones se habilitará en la Fase 2.
                </p>
            </Card>
        </div>
    );
}
