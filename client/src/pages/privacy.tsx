import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Lock, Database, Mail, UserCheck, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/header";
import logoPath from "@assets/cropped_1749956607943.png";

export default function Privacy() {
  const [, setLocation] = useLocation();
  
  const sections = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly, including your name, email address, and account preferences when you register for What the Wine."
        },
        {
          subtitle: "Wine Preferences & Ratings",
          text: "Your wine preferences, ratings, reviews, and library data help us provide personalized recommendations and improve our service."
        },
        {
          subtitle: "Usage Data",
          text: "We collect information about how you use our service, including pages visited, features used, and interaction patterns to enhance user experience."
        },
        {
          subtitle: "Image Data",
          text: "Wine bottle images you upload for scanning are processed to identify wines and are not stored permanently unless you choose to save the wine to your library."
        }
      ]
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Personalized Recommendations",
          text: "We use your preferences and past interactions to provide tailored wine recommendations through our AI-powered system."
        },
        {
          subtitle: "Account Management",
          text: "Your personal information helps us manage your account, process payments, and provide customer support."
        },
        {
          subtitle: "Service Improvement",
          text: "We analyze usage patterns and feedback to improve our recommendation algorithms and add new features."
        },
        {
          subtitle: "Communication",
          text: "We may send you service updates, wine tips, and promotional content based on your email preferences."
        }
      ]
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All data transmission is encrypted using industry-standard SSL/TLS protocols. Your personal information is stored using advanced encryption methods."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and regularly audit our systems. Only authorized personnel can access user data for specific business purposes."
        },
        {
          subtitle: "Payment Security",
          text: "Payment information is processed securely through Stripe. We never store your complete credit card information on our servers."
        },
        {
          subtitle: "Regular Security Updates",
          text: "We continuously monitor for security vulnerabilities and apply updates promptly to protect your data."
        }
      ]
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Data Sharing",
      content: [
        {
          subtitle: "No Sale of Personal Data",
          text: "We never sell your personal information to third parties. Your wine preferences and personal data remain private."
        },
        {
          subtitle: "Service Providers",
          text: "We work with trusted service providers for hosting, payment processing, and email delivery, all bound by strict confidentiality agreements."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information if required by law, to protect our rights, or to ensure user safety and service integrity."
        },
        {
          subtitle: "Community Features",
          text: "Only information you choose to share publicly (like wine reviews and recommendations) is visible to other users."
        }
      ]
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Your Rights",
      content: [
        {
          subtitle: "Access Your Data",
          text: "You can access and review your personal information anytime through your account dashboard."
        },
        {
          subtitle: "Data Portability",
          text: "You can export your wine library, preferences, and review data in a standard format upon request."
        },
        {
          subtitle: "Correction & Updates",
          text: "You can update or correct your personal information directly in your account settings."
        },
        {
          subtitle: "Account Deletion",
          text: "You can request complete account deletion, which will remove all your personal data from our systems within 30 days."
        },
        {
          subtitle: "Marketing Preferences",
          text: "You can opt out of marketing communications at any time while maintaining your account and service access."
        }
      ]
    }
  ];

  const scrollToSection = () => {}; // Placeholder for scroll function

  return (
    <div className="min-h-screen bg-gradient-to-br from-creme-50 to-burgundy-50">
      <Header onScrollTo={scrollToSection} />
      <div className="max-w-4xl mx-auto px-4 py-12">
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
            <Shield className="w-12 h-12 text-burgundy-600" />
          </div>
          <h1 className="text-4xl font-bold text-burgundy-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use What the Wine.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-burgundy-900">
                  <div className="p-2 bg-burgundy-100 rounded-lg">
                    {section.icon}
                  </div>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h4 className="font-semibold text-burgundy-800 mb-2">{item.subtitle}</h4>
                    <p className="text-gray-700 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-12 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-burgundy-900">Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this policy:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Account Data:</strong> Retained while your account is active and for 90 days after deletion</li>
                  <li><strong>Wine Library & Preferences:</strong> Retained to provide personalized recommendations until account deletion</li>
                  <li><strong>Payment Records:</strong> Retained for 7 years for accounting and legal compliance</li>
                  <li><strong>Usage Analytics:</strong> Anonymized data may be retained indefinitely for service improvement</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-burgundy-900">International Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                What the Wine is operated from the United States. If you are accessing our service from outside the US, please be aware that your information may be transferred to, stored, and processed in the United States.
              </p>
              <p className="text-gray-700">
                We take appropriate steps to ensure your data receives adequate protection in accordance with this privacy policy and applicable data protection laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-burgundy-900">Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our service is intended for users 21 years of age and older due to the nature of alcoholic beverage content. We do not knowingly collect personal information from children under 21. If we discover we have collected information from a child under 21, we will delete it immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-burgundy-900">Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We may update this privacy policy from time to time to reflect changes in our practices or for legal compliance. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mb-4">
                <li>Posting the updated policy on our website</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying a prominent notice on our service</li>
              </ul>
              <p className="text-gray-700">
                Your continued use of our service after any changes indicates your acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mt-12 bg-gradient-to-r from-burgundy-600 to-burgundy-700 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Questions About Privacy?</h3>
            <p className="text-burgundy-100 mb-6 max-w-2xl mx-auto">
              If you have questions about this privacy policy or how we handle your data, please don't hesitate to contact us.
            </p>
            <div className="space-y-2 text-burgundy-100">
              <p><strong>Email:</strong> support@whatthewine.com</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="bg-burgundy-900 text-white py-12 mt-16 -mx-4">
          <div className="max-w-4xl mx-auto px-4">
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