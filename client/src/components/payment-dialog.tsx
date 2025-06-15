import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentDialog({ isOpen, onClose }: PaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/create-checkout-session");
      const data = await response.json();
      
      // Redirect to Stripe's secure checkout
      window.location.href = data.url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-2 border-burgundy-200">
          <CardHeader className="text-center pb-4">
            <div className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-3">
              Limited Time Offer
            </div>
            <CardTitle className="text-2xl text-burgundy-700">Premium Plan</CardTitle>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="text-xl text-gray-400 line-through">$9.99</div>
              <div className="text-3xl font-bold text-burgundy-700">$3.99</div>
            </div>
            <div className="text-lg font-normal text-gray-600">/month</div>
            <div className="text-sm text-green-600 font-medium mt-1">Save 60% off regular price!</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Unlimited wine recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Advanced bottle scanning</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Personal wine library</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Expert wine insights</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Priority customer support</span>
              </div>
            </div>
            
            <Button 
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-[#722F37] hover:bg-[#5d252a] text-white"
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isLoading ? "Redirecting..." : "Secure Checkout - $3.99"}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Powered by Stripe • Cancel anytime
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}