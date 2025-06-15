import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Heart, MessageCircle, Plus, Wine, Calendar, MapPin, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const reviewSchema = z.object({
  wineId: z.number(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Review must be at least 10 characters"),
  rating: z.number().min(1).max(5),
});

const recommendationSchema = z.object({
  wineId: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  occasion: z.string().optional(),
  foodPairing: z.string().optional(),
  priceValue: z.number().min(1).max(5).optional(),
});

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

interface Wine {
  id: number;
  name: string;
  winery: string;
  region: string;
  country: string;
  type: string;
  vintage?: number;
  rating?: number;
}

interface WineReview {
  id: number;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  user: {
    username: string;
    firstName: string;
  };
  wine: Wine;
}

interface CommunityRecommendation {
  id: number;
  title: string;
  description: string;
  occasion?: string;
  foodPairing?: string;
  priceValue?: number;
  likesCount: number;
  createdAt: string;
  user: {
    username: string;
    firstName: string;
  };
  wine: Wine;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    username: string;
    firstName: string;
  };
}

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch community recommendations
  const { data: recommendations = [], isLoading: loadingRecommendations } = useQuery({
    queryKey: ["/api/community/recommendations"],
    enabled: isAuthenticated,
  });

  // Fetch user's wine library for review/recommendation forms
  const { data: libraryData, isLoading: loadingUserWines } = useQuery({
    queryKey: ["/api/library"],
    enabled: isAuthenticated,
  });
  const userWines = Array.isArray((libraryData as any)?.library) ? (libraryData as any).library : [];

  // Review form
  const reviewForm = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      wineId: 0,
      title: "",
      content: "",
      rating: 5,
    },
  });

  // Recommendation form
  const recommendationForm = useForm({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      wineId: 0,
      title: "",
      description: "",
      occasion: "",
      foodPairing: "",
      priceValue: 5,
    },
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: z.infer<typeof reviewSchema>) => {
      return apiRequest("POST", "/api/community/reviews", data);
    },
    onSuccess: () => {
      toast({
        title: "Review Posted",
        description: "Your wine review has been shared with the community!",
      });
      setShowReviewDialog(false);
      reviewForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/community/reviews"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post review. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create recommendation mutation
  const createRecommendationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof recommendationSchema>) => {
      return apiRequest("POST", "/api/community/recommendations", data);
    },
    onSuccess: () => {
      toast({
        title: "Recommendation Posted",
        description: "Your wine recommendation has been shared with the community!",
      });
      setShowRecommendationDialog(false);
      recommendationForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/community/recommendations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post recommendation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Like recommendation mutation
  const likeMutation = useMutation({
    mutationFn: async (recommendationId: number) => {
      return apiRequest("POST", `/api/community/recommendations/${recommendationId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/recommendations"] });
    },
  });

  const handleLike = (recommendationId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to like recommendations.",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate(recommendationId);
  };

  const toggleComments = (id: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedComments(newExpanded);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const renderPriceValue = (value?: number) => {
    if (!value) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <DollarSign
        key={i}
        className={`w-3 h-3 ${
          i < value ? "fill-green-500 text-green-500" : "text-gray-300"
        }`}
      />
    ));
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Wine className="w-16 h-16 text-burgundy-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-burgundy-700 mb-2">
          Join the Wine Community
        </h3>
        <p className="text-gray-600 mb-6">
          Sign in to share reviews, discover recommendations, and connect with fellow wine enthusiasts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-burgundy-700">Wine Community</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Share your wine experiences and discover new favorites from fellow enthusiasts.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
            <DialogTrigger asChild>
              <Button className="bg-burgundy-600 hover:bg-burgundy-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle>Write a Wine Review</DialogTitle>
                <DialogDescription>
                  Share your wine tasting experience with the community
                </DialogDescription>
              </DialogHeader>
              <Form {...reviewForm}>
                <form onSubmit={reviewForm.handleSubmit((data) => createReviewMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={reviewForm.control}
                    name="wineId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Wine</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a wine from your library" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingUserWines ? (
                              <SelectItem value="loading" disabled>
                                Loading wines...
                              </SelectItem>
                            ) : userWines && userWines.length > 0 ? (
                              userWines.map((entry: any) => (
                                <SelectItem key={entry.wine.id} value={entry.wine.id.toString()}>
                                  {entry.wine.name} - {entry.wine.winery}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-wines" disabled>
                                No wines in your library yet
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={reviewForm.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Rate this wine" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                <div className="flex items-center gap-2">
                                  <span>{rating}</span>
                                  <div className="flex">
                                    {renderStars(rating)}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={reviewForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Sum up your experience..." 
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={reviewForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Review</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your tasting notes, thoughts, and experiences with this wine..."
                            rows={4}
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-burgundy-600 hover:bg-burgundy-700"
                      disabled={createReviewMutation.isPending}
                    >
                      {createReviewMutation.isPending ? "Posting..." : "Post Review"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowReviewDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={showRecommendationDialog} onOpenChange={setShowRecommendationDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-burgundy-300 text-burgundy-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Share Recommendation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle>Share a Wine Recommendation</DialogTitle>
                <DialogDescription>
                  Recommend a wine to the community with details about why it's special
                </DialogDescription>
              </DialogHeader>
              <Form {...recommendationForm}>
                <form onSubmit={recommendationForm.handleSubmit((data) => createRecommendationMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={recommendationForm.control}
                    name="wineId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Wine</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a wine to recommend" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingUserWines ? (
                              <SelectItem value="loading" disabled>
                                Loading wines...
                              </SelectItem>
                            ) : userWines && userWines.length > 0 ? (
                              userWines.map((entry: any) => (
                                <SelectItem key={entry.wine.id} value={entry.wine.id.toString()}>
                                  {entry.wine.name} - {entry.wine.winery}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-wines" disabled>
                                No wines in your library yet
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={recommendationForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommendation Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Why recommend this wine?" 
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={recommendationForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe why others should try this wine..."
                            rows={3}
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={recommendationForm.control}
                      name="occasion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occasion</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Date night" 
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={recommendationForm.control}
                      name="foodPairing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Food Pairing</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Steak" 
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={recommendationForm.control}
                    name="priceValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Value (1-5)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Rate the value for money" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((value) => (
                              <SelectItem key={value} value={value.toString()}>
                                <div className="flex items-center gap-2">
                                  <span>{value === 1 ? "Poor" : value === 2 ? "Fair" : value === 3 ? "Good" : value === 4 ? "Great" : "Excellent"}</span>
                                  <div className="flex">
                                    {renderPriceValue(value)}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-burgundy-600 hover:bg-burgundy-700"
                      disabled={createRecommendationMutation.isPending}
                    >
                      {createRecommendationMutation.isPending ? "Posting..." : "Share Recommendation"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRecommendationDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Community Feed */}
      <div className="space-y-6">
        {loadingRecommendations ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-burgundy-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading community recommendations...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((recommendation: CommunityRecommendation) => (
              <Card key={recommendation.id} className="border-l-4 border-l-burgundy-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-burgundy-100 text-burgundy-700">
                          {recommendation.user.firstName?.[0] || recommendation.user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-burgundy-700">
                            {recommendation.user.firstName || recommendation.user.username}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(recommendation.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <CardTitle className="text-lg mb-2">{recommendation.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Wine className="w-4 h-4" />
                            <span>{recommendation.wine.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{recommendation.wine.winery}, {recommendation.wine.region}</span>
                          </div>
                          {recommendation.wine.vintage && (
                            <Badge variant="secondary">{recommendation.wine.vintage}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {recommendation.priceValue && (
                      <div className="flex items-center gap-1">
                        {renderPriceValue(recommendation.priceValue)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 mb-4">{recommendation.description}</p>
                  
                  {(recommendation.occasion || recommendation.foodPairing) && (
                    <div className="flex gap-4 mb-4">
                      {recommendation.occasion && (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-burgundy-600" />
                          <span className="text-gray-600">{recommendation.occasion}</span>
                        </div>
                      )}
                      {recommendation.foodPairing && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-burgundy-600">🍽️</span>
                          <span className="text-gray-600">{recommendation.foodPairing}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(recommendation.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {recommendation.likesCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleComments(recommendation.id)}
                        className="text-gray-600"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Comments
                      </Button>
                    </div>
                    <Badge className="bg-burgundy-100 text-burgundy-700">
                      {recommendation.wine.type}
                    </Badge>
                  </div>

                  {/* Comments section would go here */}
                  {expandedComments.has(recommendation.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 text-center py-4">
                        Comments feature coming soon! 🍷
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {recommendations.length === 0 && (
              <div className="text-center py-12">
                <Wine className="w-16 h-16 text-burgundy-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-burgundy-700 mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to share a wine recommendation with the community!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}