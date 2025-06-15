import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, MessageCircle, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import Header from "@/components/header";
import logoPath from "@assets/cropped_1749956607943.png";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Contact form submitted:", data);
      setIsSubmitted(true);
      reset();
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Us",
      description: "support@whatthewine.com",
      subtitle: "We typically respond within 24 hours"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Call Us",
      description: "+1 (555) 123-WINE",
      subtitle: "Monday - Friday, 9 AM - 6 PM EST"
    }
  ];

  const subjects = [
    "General Question",
    "Technical Support",
    "Account Issue",
    "Premium Subscription",
    "Wine Recommendations",
    "Bug Report",
    "Feature Request",
    "Partnership Inquiry"
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-creme-50 to-burgundy-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-burgundy-900 mb-4">Message Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We've received your message and will get back to you within 24 hours.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="bg-burgundy-600 hover:bg-burgundy-700"
            >
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scrollToSection = () => {}; // Placeholder for scroll function

  return (
    <div className="min-h-screen bg-gradient-to-br from-creme-50 to-burgundy-50">
      <Header onScrollTo={scrollToSection} />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-burgundy-600 hover:text-burgundy-700 hover:bg-burgundy-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="w-12 h-12 text-burgundy-600" />
          </div>
          <h1 className="text-4xl font-bold text-burgundy-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question or need help? We're here to assist you with all your wine discovery needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-burgundy-900">
                  <Clock className="w-5 h-5" />
                  <span>Get in Touch</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-2 bg-burgundy-100 rounded-lg">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-burgundy-900">{info.title}</h3>
                      <p className="text-burgundy-700 font-medium">{info.description}</p>
                      <p className="text-sm text-gray-600">{info.subtitle}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-burgundy-900 mb-4">Frequently Asked Questions</h3>
                <p className="text-gray-600 mb-4">
                  Before reaching out, check our Help Center for quick answers to common questions.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-burgundy-300 text-burgundy-700 hover:bg-burgundy-50"
                  onClick={() => window.location.href = "/help"}
                >
                  Visit Help Center
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-burgundy-900">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        className="mt-1"
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="mt-1"
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select onValueChange={(value) => setValue("subject", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      {...register("message")}
                      className="mt-1 min-h-[120px]"
                      placeholder="Tell us how we can help you..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-burgundy-600 hover:bg-burgundy-700"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-burgundy-600 to-burgundy-700 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Need Immediate Help?</h3>
              <p className="text-burgundy-100 mb-6 max-w-2xl mx-auto">
                For urgent technical issues or account problems, our premium users get priority support through our direct line.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-burgundy-700"
                  onClick={() => window.location.href = "/help"}
                >
                  Browse Help Articles
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-burgundy-700"
                  onClick={() => window.location.href = "/dashboard"}
                >
                  Check Account Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="bg-burgundy-900 text-white py-12 mt-16 -mx-4">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={logoPath} 
                    alt="What the Wine" 
                    className="h-8 w-8 object-contain"
                  />
                  <h4 className="font-bold text-xl">What the Wine</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Your intelligent wine companion for discovering exceptional wines.
                </p>
              </div>

              <div>
                <h5 className="font-semibold mb-4">Quick Links</h5>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><a href="/" className="hover:text-gold-400 transition-colors">Home</a></li>
                  <li><a href="/help" className="hover:text-gold-400 transition-colors">Help Center</a></li>
                  <li><a href="/contact" className="hover:text-gold-400 transition-colors">Contact Us</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold mb-4">Legal</h5>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><a href="/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-gold-400 transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-burgundy-800 pt-6 text-center text-gray-400 text-sm">
              <p>© 2024 What the Wine. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}