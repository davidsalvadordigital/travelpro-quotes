"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
    value?: string;
    onChange: (base64Image: string) => void;
    label?: string;
    className?: string;
}

export function ImageUploader({ value, onChange, label = "Imagen Principal", className }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError(null);
        
        if (!file.type.startsWith("image/")) {
            setError("Por favor selecciona un archivo de imagen válido (JPG, PNG).");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen supera los 5MB. Por favor elige una más ligera.");
            return;
        }

        try {
            setIsCompressing(true);
            const options = {
                maxSizeMB: 0.2, // Compress to max 200KB
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: "image/jpeg" as const,
            };

            const compressedFile = await imageCompression(file, options);
            
            // Convert to base64 to store in the state (and ultimately send to Supabase)
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onloadend = () => {
                const base64data = reader.result as string;
                onChange(base64data);
                setIsCompressing(false);
            };
        } catch (error) {
            console.error(error);
            setError("Hubo un error al procesar la imagen.");
            setIsCompressing(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {label && (
                <label 
                    htmlFor="destination-image-upload"
                    className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.2em] ml-1 text-muted-foreground/60 cursor-pointer hover:text-brand-primary transition-colors"
                >
                    <ImageIcon className="h-4 w-4 text-brand-primary" strokeWidth={3} />
                    {label}
                </label>
            )}
            
            <div
                onClick={() => !value && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    "relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group",
                    isDragging ? "border-brand-primary bg-brand-primary/5 shadow-xl shadow-brand-primary/10" : "border-glass-border bg-background/50 hover:border-brand-primary/40 hover:bg-brand-primary/5",
                    value ? "border-none" : "cursor-pointer"
                )}
            >
                <input
                    type="file"
                    id="destination-image-upload"
                    ref={fileInputRef}
                    onChange={handleChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                />

                {isCompressing ? (
                    <div className="flex flex-col items-center gap-4 text-brand-primary animate-pulse">
                        <Loader2 className="h-10 w-10 animate-spin" />
                        <span className="text-sm font-semibold tracking-wide">Optimizando imagen...</span>
                    </div>
                ) : value ? (
                    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center">
                        <img 
                            src={value} 
                            alt="Destination preview" 
                            className="absolute inset-0 w-full h-full object-cover z-0"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                            <button 
                                onClick={removeImage}
                                className="bg-destructive/90 text-white rounded-full p-3 hover:bg-destructive hover:scale-110 transition-all shadow-xl"
                            >
                                <X className="h-6 w-6" strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground/50 p-6 text-center">
                        <div className="p-4 rounded-full bg-muted/50 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors duration-300">
                            <UploadCloud className="h-8 w-8" strokeWidth={2.5} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-semibold text-foreground/80">Arrastra una imagen o haz clic</p>
                            <p className="text-xs font-medium uppercase tracking-wider">PNG, JPG (Máx 5MB)</p>
                        </div>
                        {error && (
                            <div className="mt-2 text-sm font-medium text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                                {error}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
