import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { analyzeWineBottle, addWineToLibrary } from "@/lib/api";
import type { Wine } from "@shared/schema";
import WineCard from "./wine-card";
import AuthDialog from "./auth-dialog";

function BottleSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Capsule / foil */}
      <rect x="22" y="4" width="16" height="20" rx="3" fill="currentColor" opacity="0.25" />
      {/* Neck */}
      <rect x="25" y="22" width="10" height="30" rx="2" fill="currentColor" opacity="0.18" />
      {/* Shoulder */}
      <path d="M25 52 Q18 64 16 80 L44 80 Q42 64 35 52 Z" fill="currentColor" opacity="0.18" />
      {/* Body */}
      <rect x="16" y="80" width="28" height="72" rx="3" fill="currentColor" opacity="0.18" />
      {/* Label area */}
      <rect x="20" y="92" width="20" height="44" rx="1" fill="currentColor" opacity="0.10" />
      {/* Punt */}
      <ellipse cx="30" cy="148" rx="8" ry="3" fill="currentColor" opacity="0.12" />
    </svg>
  );
}

export default function WineScanner() {
  const [analyzedWine, setAnalyzedWine] = useState<Wine | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const analysisMutation = useMutation({
    mutationFn: analyzeWineBottle,
    onSuccess: async (data) => {
      setAnalyzedWine(data.wine);
      setIsSaved(false);
      if (isAuthenticated && user) {
        try {
          await addWineToLibrary(user.id, data.wine.id);
          setIsSaved(true);
          queryClient.invalidateQueries({ queryKey: ["/api/wine-library", user.id] });
          toast({ title: "Identified & saved", description: `${data.wine.name} added to your library.` });
        } catch {
          toast({ title: "Identified", description: `${data.wine.name} recognised.` });
        }
      } else {
        toast({ title: "Identified", description: `${data.wine.name} recognised.` });
      }
    },
    onError: (error) => {
      toast({ title: "Analysis failed", description: error.message || "Failed to analyse wine bottle", variant: "destructive" });
    },
  });

  const saveWineMutation = useMutation({
    mutationFn: () => {
      if (!isAuthenticated || !user) throw new Error("Please sign in to save wines to your library");
      return addWineToLibrary(user.id, analyzedWine!.id);
    },
    onSuccess: () => {
      setIsSaved(true);
      queryClient.invalidateQueries({ queryKey: ["/api/wine-library", user?.id] });
      toast({ title: "Saved", description: "Added to your wine library." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to save wine", variant: "destructive" });
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image smaller than 10MB", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    analysisMutation.mutate(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const isPending = analysisMutation.isPending;

  return (
    <section id="scan" className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {!analyzedWine ? (
          /* ── Drop Zone ── */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={isPending ? undefined : openFileDialog}
            className={`relative overflow-hidden cursor-pointer group transition-all duration-300 border ${
              dragActive
                ? "border-[#722F37] dark:border-[#C9A84C]"
                : "border-border hover:border-[#722F37]/60 dark:hover:border-[#C9A84C]/60"
            } bg-card`}
            style={{ minHeight: 400 }}
          >
            {/* Subtle radial glow behind bottle */}
            <div
              className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
              style={{
                background: dragActive
                  ? "radial-gradient(ellipse 50% 60% at 50% 55%, rgba(114,47,55,0.15) 0%, transparent 70%)"
                  : "radial-gradient(ellipse 40% 50% at 50% 55%, rgba(114,47,55,0.07) 0%, transparent 70%)",
              }}
            />

            {/* Animated corner accents */}
            {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((cls, i) => (
              <div key={i} className={`absolute w-6 h-6 ${cls} transition-colors duration-300 ${
                dragActive ? "border-[#722F37] dark:border-[#C9A84C]" : "border-[#722F37]/20 dark:border-[#C9A84C]/20 group-hover:border-[#722F37]/50 dark:group-hover:border-[#C9A84C]/50"
              }`} />
            ))}

            <div className="relative z-10 flex flex-col items-center justify-center py-20 px-8">
              {isPending ? (
                /* Analyzing state */
                <div className="text-center">
                  <div className="relative mb-8 mx-auto w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-[#722F37]/30 dark:border-[#C9A84C]/30 animate-ping" />
                    <div className="absolute inset-2 rounded-full border border-[#722F37]/20 dark:border-[#C9A84C]/20 animate-ping" style={{ animationDelay: "0.3s" }} />
                    {previewUrl ? (
                      <img src={previewUrl} alt="" className="w-16 h-16 object-cover rounded-full opacity-60" />
                    ) : (
                      <Loader2 className="w-8 h-8 text-[#722F37] dark:text-[#C9A84C] animate-spin" />
                    )}
                  </div>
                  <p className="font-playfair text-xl text-foreground mb-2">Reading the label…</p>
                  <p className="text-sm text-muted-foreground">Our sommelier is at work</p>
                </div>
              ) : (
                /* Idle state */
                <div className="text-center">
                  <div className="relative mb-8 mx-auto flex items-center justify-center h-40">
                    <BottleSilhouette className="h-40 text-[#722F37] dark:text-[#C9A84C] transition-transform duration-500 group-hover:scale-105" />
                    {/* Scan line animation on hover */}
                    <div className="absolute inset-x-0 h-px top-1/2 bg-gradient-to-r from-transparent via-[#722F37]/60 dark:via-[#C9A84C]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                  </div>
                  <p className="font-playfair text-xl text-foreground mb-2">
                    {dragActive ? "Drop to identify" : "Drop a photo or tap to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">
                    Tasting notes, food pairings, and vintage score — instantly
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={(e) => { e.stopPropagation(); openFileDialog(); }}
                      className="bg-[#722F37] hover:bg-[#5d252a] dark:bg-[#C9A84C] dark:hover:bg-[#B8922A] dark:text-[#120810] text-white rounded-none px-8 py-3 tracking-wider text-sm"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); openFileDialog(); }}
                      className="border-[#722F37]/30 dark:border-[#C9A84C]/30 text-[#722F37] dark:text-[#C9A84C] hover:bg-[#722F37]/5 dark:hover:bg-[#C9A84C]/10 rounded-none px-8 py-3 tracking-wider text-sm"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Result ── */
          <div className="max-w-2xl mx-auto">
            {/* Header bar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Identified</p>
              <button
                onClick={() => { setAnalyzedWine(null); setPreviewUrl(null); setIsSaved(false); }}
                className="text-xs uppercase tracking-widest text-[#722F37] dark:text-[#C9A84C] hover:opacity-70 transition-opacity"
              >
                ← Scan another
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 items-start">
              {previewUrl && (
                <div className="overflow-hidden">
                  <img src={previewUrl} alt="Scanned bottle" className="w-full object-cover" style={{ maxHeight: 320, objectPosition: "center top" }} />
                </div>
              )}
              <div className={previewUrl ? "" : "sm:col-span-2"}>
                <WineCard
                  wine={analyzedWine}
                  onSave={isAuthenticated ? () => saveWineMutation.mutate() : undefined}
                  isSaved={isSaved}
                />
                {!isAuthenticated && (
                  <div className="mt-4 flex gap-2">
                    <AuthDialog defaultMode="login">
                      <Button size="sm" className="flex-1 bg-[#722F37] hover:bg-[#5d252a] text-white rounded-none text-xs tracking-wider">
                        Sign In to Save
                      </Button>
                    </AuthDialog>
                    <AuthDialog defaultMode="register">
                      <Button variant="outline" size="sm"
                        className="flex-1 border-[#722F37]/30 text-[#722F37] hover:bg-[#722F37]/5 rounded-none text-xs tracking-wider">
                        Create Account
                      </Button>
                    </AuthDialog>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
      </div>
    </section>
  );
}
