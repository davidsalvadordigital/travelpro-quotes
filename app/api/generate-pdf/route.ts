import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json(
        {
            error: "La generación de PDF se ha movido al lado del cliente utilizando @react-pdf/renderer para la Fase 4.",
        },
        { status: 501 }
    );
}
