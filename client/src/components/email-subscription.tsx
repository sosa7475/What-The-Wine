import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const subscriptionSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SubscriptionForm = z.infer<typeof subscriptionSchema>;

export default function EmailSubscriptionForm() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
  });

  const onSubmit = async (data: SubscriptionForm) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/subscribe", { email: data.email });
      setIsSubscribed(true);
      reset();
      toast({
        title: "Successfully Subscribed!",
        description: "You'll receive weekly wine recommendations and exclusive offers.",
      });
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-green-800 mb-2">
            Welcome to our community!
          </h4>
          <p className="text-green-700">
            You're now subscribed to receive weekly wine recommendations, expert tips, and exclusive offers.
          </p>
          <Button
            onClick={() => setIsSubscribed(false)}
            variant="outline"
            size="sm"
            className="mt-4 border-green-300 text-green-700 hover:bg-green-50"
          >
            Subscribe another email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter your email address"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-burgundy-600 hover:bg-burgundy-700 text-white px-6 py-3 whitespace-nowrap"
        >
          {isLoading ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
      <p className="text-sm text-gray-500 mt-3 text-center">
        No spam, unsubscribe anytime. Your privacy is important to us.
      </p>
    </form>
  );
}