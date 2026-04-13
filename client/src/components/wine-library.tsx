import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { UserWineLibrary, Wine } from "@shared/schema";
import WineCard from "./wine-card";
import AuthDialog from "./auth-dialog";

interface WineLibraryProps {
  onNavigateToRecommendations?: () => void;
}

export default function WineLibrary({ onNavigateToRecommendations }: WineLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: libraryData, isLoading } = useQuery({
    queryKey: ["/api/library"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/library");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const removeWineMutation = useMutation({
    mutationFn: async ({ wineId }: { wineId: number }) => {
      const response = await apiRequest("DELETE", `/api/library/${wineId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      toast({
        title: "Wine Removed",
        description: "Wine removed from your library",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove wine",
        variant: "destructive",
      });
    },
  });

  const handleRemoveWine = (wineId: number) => {
    removeWineMutation.mutate({ wineId });
  };

  const filteredWines = libraryData?.library.filter((entry: UserWineLibrary & { wine: Wine }) => {
    const wine = entry.wine;
    const matchesSearch = 
      wine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wine.winery.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wine.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || wine.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  }) || [];

  if (authLoading) {
    return (
      <section id="library" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section id="library" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, #722F37)" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#722F37]" />
              <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, #722F37)" }} />
            </div>
            <p className="font-playfair text-2xl text-[#722F37] italic mb-3">
              Every great cellar begins with a single bottle.
            </p>
            <p className="text-sm text-gray-500 mb-10">
              Sign in to save discoveries, track favourites, and build your personal collection.
            </p>
            <div className="flex gap-3 justify-center">
              <AuthDialog defaultMode="register">
                <Button className="bg-[#722F37] hover:bg-[#5d252a] text-white rounded-none px-8 py-3 tracking-wider text-sm">
                  Create Account
                </Button>
              </AuthDialog>
              <AuthDialog defaultMode="login">
                <Button variant="outline" className="border-[#722F37]/30 text-[#722F37] hover:bg-[#722F37]/5 rounded-none px-8 py-3 tracking-wider text-sm">
                  Sign In
                </Button>
              </AuthDialog>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section id="library" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="library" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:justify-end lg:items-center mb-12 space-y-6 lg:space-y-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search wines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-creme-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40 border-creme-300 focus:ring-burgundy-500">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="red">Red Wine</SelectItem>
                <SelectItem value="white">White Wine</SelectItem>
                <SelectItem value="rose">Rosé</SelectItem>
                <SelectItem value="sparkling">Sparkling</SelectItem>
                <SelectItem value="dessert">Dessert Wine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredWines.length === 0 ? (
          <Card className="bg-creme-50 rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="font-playfair text-xl font-semibold text-burgundy-700 mb-2">
                {libraryData?.library.length === 0 ? "No wines in your library yet" : "No wines match your filters"}
              </h4>
              <p className="text-gray-600">
                {libraryData?.library.length === 0 
                  ? "Start building your wine collection by saving recommendations or scanning wine bottles."
                  : "Try adjusting your search or filter criteria to find more wines."
                }
              </p>
              {libraryData?.library.length === 0 && (
                <Button
                  onClick={onNavigateToRecommendations}
                  className="mt-4 bg-burgundy-600 hover:bg-burgundy-700 text-white"
                >
                  Get Recommendations
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredWines.map((entry: UserWineLibrary & { wine: Wine }) => (
                <WineCard
                  key={entry.id}
                  wine={entry.wine}
                  onRemove={() => handleRemoveWine(entry.wine.id)}
                  showRemove={true}
                  isInLibrary={true}
                />
              ))}
            </div>

            {filteredWines.length < (libraryData?.library.length || 0) && (
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  Showing {filteredWines.length} of {libraryData?.library.length} wines
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
