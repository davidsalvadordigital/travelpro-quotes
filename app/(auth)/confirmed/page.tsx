import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ConfirmedPage() {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="rounded-full bg-emerald-100/50 p-6 shadow-sm ring-1 ring-emerald-200">
                <CheckCircle2 className="h-16 w-16 text-emerald-600 drop-shadow-sm" />
            </div>

            <div className="space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    ¡Correo Confirmado!
                </h1>
                <p className="text-slate-600 max-w-sm text-lg leading-relaxed">
                    Tu identidad ha sido verificada de forma segura. Ya puedes acceder a todas las funcionalidades premium de <strong className="font-semibold text-cyan-700">TravelPro Quotes</strong>.
                </p>
            </div>

            <div className="pt-4 w-full">
                <Link href="/dashboard" className="w-full inline-block">
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-lg shadow-cyan-600/20 active:scale-[0.98] transition-all h-12 text-base font-semibold">
                        Entrar al Sistema
                    </Button>
                </Link>
            </div>
        </div>
    );
}
