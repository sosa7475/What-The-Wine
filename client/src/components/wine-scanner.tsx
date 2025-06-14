import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeWineBottle, addWineToLibrary } from "@/lib/api";
import type { Wine } from "@shared/schema";
import WineCard from "./wine-card";

export default function WineScanner() {
  const [analyzedWine, setAnalyzedWine] = useState<Wine | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const analysisMutation = useMutation({
    mutationFn: analyzeWineBottle,
    onSuccess: (data) => {
      setAnalyzedWine(data.wine);
      setIsSaved(false);
      toast({
        title: "Wine Analyzed",
        description: `Successfully identified ${data.wine.name}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze wine bottle",
        variant: "destructive",
      });
    },
  });

  const saveWineMutation = useMutation({
    mutationFn: () => addWineToLibrary(1, analyzedWine!.id),
    onSuccess: () => {
      setIsSaved(true);
      // Invalidate library cache to refresh the wine library
      queryClient.invalidateQueries({ queryKey: ["/api/library/1"] });
      toast({
        title: "Wine Saved",
        description: "Added to your wine library!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save wine",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    analysisMutation.mutate(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <section id="scan" className="py-20 bg-creme-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="font-playfair text-4xl font-bold text-burgundy-700 mb-4">
            Scan Wine Bottles
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Take a photo of any wine bottle to get detailed information, tasting notes, and food pairing suggestions
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Camera Interface */}
            <Card className="bg-white rounded-2xl p-8 shadow-lg">
              <h4 className="font-playfair text-2xl font-semibold text-burgundy-700 mb-6 text-center">
                Scan Your Wine
              </h4>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 ${
                  dragActive
                    ? "border-burgundy-500 bg-burgundy-50"
                    : analysisMutation.isPending
                    ? "border-creme-300 bg-creme-50"
                    : "border-creme-300 bg-creme-50 hover:border-burgundy-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={analysisMutation.isPending ? undefined : openFileDialog}
              >
                {analysisMutation.isPending ? (
                  <>
                    <Loader2 className="h-12 w-12 text-burgundy-600 mb-4 mx-auto animate-spin" />
                    <p className="text-burgundy-700 font-medium mb-2">Analyzing wine...</p>
                    <p className="text-gray-500 text-sm">Please wait while we identify your wine</p>
                  </>
                ) : (
                  <>
                    <Camera className="h-12 w-12 text-burgundy-600 mb-4 mx-auto" />
                    <p className="text-burgundy-700 font-medium mb-2">Tap to select a photo</p>
                    <p className="text-gray-500 text-sm">or drag and drop an image</p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="mt-6 flex space-x-4">
                <Button
                  onClick={openFileDialog}
                  disabled={analysisMutation.isPending}
                  className="flex-1 bg-burgundy-600 hover:bg-burgundy-700 text-white py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </Button>
                <Button
                  onClick={openFileDialog}
                  disabled={analysisMutation.isPending}
                  variant="outline"
                  className="flex-1 border-burgundy-600 text-burgundy-600 hover:bg-burgundy-50 py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gallery
                </Button>
              </div>
            </Card>

            {/* Wine Analysis Results */}
            {analyzedWine && (
              <div className="max-w-sm mx-auto">
                <WineCard
                  wine={analyzedWine}
                  onSave={() => saveWineMutation.mutate()}
                  isSaved={isSaved}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
