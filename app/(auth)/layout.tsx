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
                    <span className="text-2xl font-black text-white tracking-tighter">
                        Trapp<span className="text-white/80 font-light italic">vel</span>
                    </span>
                </div>

                {/* Main Hero Section */}
                <div className="relative z-10 max-w-lg">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white border border-white/20 backdrop-blur-sm">
                                Travel Intelligence
                            </span>
                            <h2 className="text-6xl font-black leading-[1] tracking-tighter text-white">
                                Cotiza el <br />
                                <span className="text-white/90">
                                    mundo.
                                </span>
                            </h2>
                        </div>
                        <p className="text-xl leading-relaxed text-white/80 font-bold tracking-tight">
                            El motor que impulsa a las agencias que no conocen fronteras. 
                            Rápido, vivo y diseñado para el éxito.
                        </p>
                        
                        {/* Executive KPIs */}
                        <div className="grid grid-cols-3 gap-10 pt-10 border-t border-white/10">
                            <div className="space-y-1">
                                <div className="text-4xl font-black text-white tracking-tighter tabular-nums">+500</div>
                                <div className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Cotizaciones</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-black text-white tracking-tighter tabular-nums">98%</div>
                                <div className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Precisión IA</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-black text-white tracking-tighter tabular-nums">2min</div>
                                <div className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Entrega</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layout Footer */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-black text-white/60 uppercase tracking-[0.25em]">
                    <span>© 2026 Trappvel Quotes</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                    <span>Adventure Engine v4</span>
                </div>
            </div>

            {/* Right Pane — Auth Form */}
            <div className="flex items-center justify-center bg-background p-6 sm:p-12">
                <div className="w-full max-w-[420px]">{children}</div>
            </div>
        </div>
    );
}
