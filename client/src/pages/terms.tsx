import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, Users, CreditCard, AlertTriangle, Shield } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Service Agreement",
      content: [
        {
          subtitle: "Acceptance of Terms",
          text: "By accessing or using What the Wine, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service."
        },
        {
          subtitle: "Eligibility",
          text: "You must be at least 21 years old to use What the Wine due to the alcoholic beverage content. By using our service, you represent and warrant that you meet this age requirement."
        },
        {
          subtitle: "Account Registration",
          text: "You must provide accurate, current, and complete information during registration and keep your account information updated. You are responsible for safeguarding your account credentials."
        },
        {
          subtitle: "Service Description",
          text: "What the Wine provides AI-powered wine recommendations, bottle scanning, personal wine library management, and community features to enhance your wine discovery experience."
        }
      ]
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "User Responsibilities",
      content: [
        {
          subtitle: "Lawful Use",
          text: "You agree to use our service only for lawful purposes and in accordance with these terms. You will not use the service in any way that could damage, disable, or impair our systems."
        },
        {
          subtitle: "Content Guidelines",
          text: "When posting reviews, comments, or recommendations, you must provide honest, accurate information. Content must not be offensive, inappropriate, or violate others' rights."
        },
        {
          subtitle: "Prohibited Activities",
          text: "You may not: reverse engineer our software, attempt unauthorized access, spam or harass other users, or use automated systems to access our service without permission."
        },
        {
          subtitle: "Account Security",
          text: "You are responsible for all activities under your account. Notify us immediately of any unauthorized use or security breaches."
        }
      ]
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Premium Subscription",
      content: [
        {
          subtitle: "Subscription Features",
          text: "Premium subscription includes unlimited wine recommendations, advanced bottle scanning, automatic library saves, and priority customer support for $3.99 per month."
        },
        {
          subtitle: "Billing",
          text: "Premium subscriptions are billed monthly in advance. Payment is processed securely through Stripe. You authorize us to charge your payment method for recurring subscription fees."
        },
        {
          subtitle: "Cancellation",
          text: "You may cancel your premium subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period. No refunds for partial periods."
        },
        {
          subtitle: "Free Trial",
          text: "New users receive 5 free wine recommendations. No payment information is required for the free tier. Upgrade to premium for unlimited access."
        }
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Intellectual Property",
      content: [
        {
          subtitle: "Our Content",
          text: "All content, features, and functionality of What the Wine, including but not limited to text, graphics, logos, images, and software, are owned by us and protected by copyright and trademark laws."
        },
        {
          subtitle: "User Content",
          text: "You retain ownership of content you submit (reviews, photos, comments). By submitting content, you grant us a license to use, display, and distribute it in connection with our service."
        },
        {
          subtitle: "Wine Data",
          text: "Wine information, ratings, and recommendations are provided for informational purposes. We aggregate data from various sources and cannot guarantee complete accuracy."
        },
        {
          subtitle: "Third-Party Content",
          text: "We may display content from third-party sources. We are not responsible for the accuracy or reliability of such content and do not endorse any third-party opinions."
        }
      ]
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Disclaimers & Limitations",
      content: [
        {
          subtitle: "Service Availability",
          text: "We strive to provide continuous service but cannot guarantee 100% uptime. We may temporarily suspend service for maintenance, updates, or technical issues."
        },
        {
          subtitle: "Recommendation Accuracy",
          text: "Wine recommendations are based on AI analysis and user preferences. We cannot guarantee you will enjoy recommended wines, as taste is subjective."
        },
        {
          subtitle: "Health & Safety",
          text: "Our service provides information about alcoholic beverages. Please drink responsibly and in accordance with local laws. We are not responsible for health or safety issues related to alcohol consumption."
        },
        {
          subtitle: "Limitation of Liability",
          text: "Our liability is limited to the amount you paid for our service in the 12 months preceding any claim. We are not liable for indirect, incidental, or consequential damages."
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
            <FileText className="w-12 h-12 text-burgundy-600" />
          </div>
          <h1 className="text-4xl font-bold text-burgundy-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            These terms govern your use of What the Wine. Please read them carefully as they contain important information about your rights and obligations.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Terms Sections */}
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

        {/* Additional Terms */}
        <div className="mt-12 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-burgundy-900">Privacy & Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our Privacy Policy, which is incorporated into these terms by reference, explains how we collect, use, and protect your information. Key points include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>We never sell your personal information to third parties</li>
                <li>Your wine preferences and library data remain private</li>
                <li>We use industry-standard encryption to protect your data</li>
                <li>You can export or delete your data at any time</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-burgundy-900">Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-burgundy-800 mb-2">Informal Resolution</h4>
                  <p className="text-gray-700">
                    Before pursuing formal dispute resolution, please contact us at support@whatthewine.com to resolve any issues informally. We commit to working with you in good faith to address concerns.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-burgundy-800 mb-2">Governing Law</h4>
                  <p className="text-gray-700">
                    These terms are governed by the laws of California, United States, without regard to conflict of law principles. Any disputes will be resolved in the courts of California.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-burgundy-800 mb-2">Class Action Waiver</h4>
                  <p className="text-gray-700">
                    You agree to resolve disputes with us individually and waive the right to participate in class action lawsuits or class-wide arbitrations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-burgundy-900">Service Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-burgundy-800 mb-2">Feature Updates</h4>
                  <p className="text-gray-700">
                    We regularly update our service with new features and improvements. We may modify or discontinue features with reasonable notice to users.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-burgundy-800 mb-2">Terms Updates</h4>
                  <p className="text-gray-700">
                    We may update these terms from time to time. Material changes will be communicated through email or prominent notice on our service. Continued use constitutes acceptance of updated terms.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-burgundy-800 mb-2">Service Termination</h4>
                  <p className="text-gray-700">
                    We may suspend or terminate your account for violations of these terms or for any other reason with reasonable notice. You may terminate your account at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-burgundy-900">Miscellaneous</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-burgundy-800 mb-2">Entire Agreement</h4>
                  <p className="text-gray-700">
                    These terms, together with our Privacy Policy, constitute the entire agreement between you and What the Wine regarding our service.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-burgundy-800 mb-2">Severability</h4>
                  <p className="text-gray-700">
                    If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-burgundy-800 mb-2">Assignment</h4>
                  <p className="text-gray-700">
                    We may assign these terms or our rights hereunder without restriction. You may not assign your rights under these terms without our written consent.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mt-12 bg-gradient-to-r from-burgundy-600 to-burgundy-700 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Questions About These Terms?</h3>
            <p className="text-burgundy-100 mb-6 max-w-2xl mx-auto">
              If you have questions about these terms of service or need clarification on any provision, please contact us.
            </p>
            <div className="space-y-2 text-burgundy-100">
              <p><strong>Email:</strong> legal@whatthewine.com</p>
            </div>
            <p className="text-sm text-burgundy-200 mt-6">
              By using What the Wine, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}