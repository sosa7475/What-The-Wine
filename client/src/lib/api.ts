import { apiRequest } from "./queryClient";
import type { Wine, WinePreferences } from "@shared/schema";

export interface WineRecommendationResponse {
  wines: Wine[];
}

export interface WineAnalysisResponse {
  wine: Wine;
}

export interface WineLibraryResponse {
  library: Array<{
    id: number;
    userId: number;
    wineId: number;
    dateAdded: Date;
    personalNotes?: string;
    wine: Wine;
  }>;
}

export async function getWineRecommendations(preferences: WinePreferences): Promise<WineRecommendationResponse> {
  const response = await apiRequest("POST", "/api/recommendations", preferences);
  return response.json();
}

export async function analyzeWineBottle(imageFile: File): Promise<WineAnalysisResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch("/api/analyze-bottle", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to analyze wine bottle" }));
    throw new Error(errorData.error || errorData.message || "Failed to analyze wine bottle");
  }

  return response.json();
}

export async function getUserWineLibrary(userId: number): Promise<WineLibraryResponse> {
  const response = await apiRequest("GET", `/api/library/${userId}`);
  return response.json();
}

export async function addWineToLibrary(userId: number, wineId: number, personalNotes?: string): Promise<void> {
  await apiRequest("POST", "/api/library", {
    userId,
    wineId,
    personalNotes,
  });
}

export async function removeWineFromLibrary(userId: number, wineId: number): Promise<void> {
  await apiRequest("DELETE", `/api/library/${userId}/${wineId}`);
}

export async function searchWines(query: string): Promise<{ wines: Wine[] }> {
  const response = await apiRequest("GET", `/api/wines/search?q=${encodeURIComponent(query)}`);
  return response.json();
}

export async function getWinesByType(type: string): Promise<{ wines: Wine[] }> {
  const response = await apiRequest("GET", `/api/wines/type/${type}`);
  return response.json();
}
