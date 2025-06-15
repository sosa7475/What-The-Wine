import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, Book, Wine, Camera, CreditCard, Settings } from "lucide-react";
import { useLocation } from "wouter";

export default function HelpCenter() {
  const [, setLocation] = useLocation();

  const faqs = [
    {
      category: "Getting Started",
      icon: <Book className="w-5 h-5" />,
      questions: [
        {
          question: "How do I get wine recommendations?",
          answer: "Simply fill out our recommendation form with your preferences like wine type, budget, occasion, and food pairings. Our AI will suggest personalized wines based on your tastes."
        },
        {
          question: "How many free recommendations do I get?",
          answer: "You get 5 free wine recommendations. After that, you can upgrade to premium for unlimited recommendations and additional features."
        },
        {
          question: "Do I need to create an account?",
          answer: "You can browse and get basic recommendations without an account, but creating one lets you save wines to your library, track recommendation history, and access premium features."
        }
      ]
    },
    {
      category: "Wine Scanner",
      icon: <Camera className="w-5 h-5" />,
      questions: [
        {
          question: "How does the wine bottle scanner work?",
          answer: "Upload a clear photo of your wine bottle label. Our AI analyzes the image to identify the wine and provide detailed information including ratings, tasting notes, and food pairings."
        },
        {
          question: "What if my wine isn't recognized?",
          answer: "If our scanner can't identify your wine, you can manually add it to your library with the wine's details. We're constantly improving our recognition database."
        },
        {
          question: "Can I scan multiple bottles at once?",
          answer: "Currently, you can scan one bottle at a time. For premium users, scanned wines are automatically saved to your library for easy reference."
        }
      ]
    },
    {
      category: "Wine Library",
      icon: <Wine className="w-5 h-5" />,
      questions: [
        {
          question: "How do I add wines to my library?",
          answer: "You can add wines by saving recommendations, scanning bottle labels, or manually entering wine details. Your library helps track wines you've tried or want to try."
        },
        {
          question: "Can I organize my wine library?",
          answer: "Yes! You can filter your library by wine type, rating, price range, and search by name, winery, or region to easily find specific wines."
        },
        {
          question: "Is my wine library private?",
          answer: "Your personal wine library is completely private and only visible to you. However, you can share wine reviews and recommendations with the community if you choose."
        }
      ]
    },
    {
      category: "Premium Features",
      icon: <CreditCard className="w-5 h-5" />,
      questions: [
        {
          question: "What's included in the premium subscription?",
          answer: "Premium includes unlimited wine recommendations, advanced bottle scanning, automatic library saves, expert wine insights, and priority customer support."
        },
        {
          question: "How much does premium cost?",
          answer: "Premium costs $3.99 per month. We're currently offering a limited-time discount of 60% off the regular price."
        },
        {
          question: "Can I cancel my premium subscription anytime?",
          answer: "Yes, you can cancel your premium subscription at any time through your account settings. You'll continue to have premium access until the end of your billing period."
        }
      ]
    },
    {
      category: "Account & Settings",
      icon: <Settings className="w-5 h-5" />,
      questions: [
        {
          question: "How do I update my account information?",
          answer: "You can update your profile information, email preferences, and password in your account settings on the dashboard."
        },
        {
          question: "How do I delete my account?",
          answer: "To delete your account, please contact our support team. We'll help you remove your data in accordance with our privacy policy."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes, we use industry-standard encryption and security measures to protect your personal information. We never share your data with third parties without your consent."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-creme-50 to-burgundy-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-burgundy-600" />
          </div>
          <h1 className="text-4xl font-bold text-burgundy-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about What the Wine's features and services.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/contact")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-burgundy-100 rounded-full">
                  <MessageCircle className="w-6 h-6 text-burgundy-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-burgundy-900">Contact Support</h3>
                  <p className="text-gray-600">Get personalized help from our team</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/dashboard")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-burgundy-100 rounded-full">
                  <Wine className="w-6 h-6 text-burgundy-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-burgundy-900">Try the App</h3>
                  <p className="text-gray-600">Start discovering wines today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-burgundy-900">
                  {category.icon}
                  <span>{category.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`}>
                      <AccordionTrigger className="text-left font-medium text-burgundy-800">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="mt-12 bg-gradient-to-r from-burgundy-600 to-burgundy-700 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
            <p className="text-burgundy-100 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Button 
              onClick={() => setLocation("/contact")}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-burgundy-700"
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}