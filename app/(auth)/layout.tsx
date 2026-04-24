import { Plane } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Left Pane — Branding & Imagery */}
            <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-brand-primary p-16">
                {/* Vibrant Mesh Gradient Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[10%] -left-[10%] h-[80%] w-[80%] rounded-full bg-cyan-400/20 blur-[120px] animate-pulse-subtle" />
                    <div className="absolute top-[20%] -right-[10%] h-[70%] w-[70%] rounded-full bg-brand-action/15 blur-[100px]" />
                    <div className="absolute -bottom-[20%] left-[20%] h-[90%] w-[90%] rounded-full bg-blue-400/20 blur-[140px]" />
                    
                    {/* Subtle Noise Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3BaseFilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
                    />

                    {/* High-End Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.1]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.1) 1.5px, transparent 1.5px)`,
                            backgroundSize: "60px 60px",
                        }}
                    />
                </div>

                {/* Logo Section */}
                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl">
                        <Plane className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-extrabold text-white tracking-tighter">
                        Trapp<span className="text-white/80 font-light italic">vel</span>
                    </span>
                </div>

                {/* Main center content — clean abstract branding */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 text-center">
                    <div className="space-y-3">
                        <h2 className="text-5xl font-extrabold leading-[1] tracking-tighter text-white">
                            Plataforma de<br />
                            <span className="text-white/70 font-light">Cotizaciones</span>
                        </h2>
                        <p className="text-base font-medium text-white/60 tracking-tight">
                            Herramienta interna Trappvel · Uso exclusivo del equipo
                        </p>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest text-center">
                            Motor de cotización · v2.0
                        </p>
                    </div>
                </div>

                {/* Layout Footer */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-medium text-white/40 uppercase tracking-[0.2em]">
                    <span>© 2026 Trappvel</span>
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    <span>Uso Interno</span>
                </div>
            </div>

            {/* Right Pane — Auth Form */}
            <div className="flex items-center justify-center bg-background p-6 sm:p-12">
                <div className="w-full max-w-[420px]">{children}</div>
            </div>
        </div>
    );
}
