import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Wine Enthusiast",
    content: "Sommelier AI helped me discover wines I never would have found on my own. The recommendations are spot-on and perfectly match my taste preferences!",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "Restaurant Owner",
    content: "I use this app to help customers choose wines that pair perfectly with our dishes. The food pairing suggestions have increased our wine sales significantly.",
    rating: 5,
  },
  {
    name: "Emma Thompson",
    role: "Home Cook",
    content: "The bottle scanning feature is incredible! I can just take a photo of any wine and get detailed information instantly. It's like having a sommelier in my pocket.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 border-[#722F37]/10 hover:border-[#722F37]/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-[#722F37]">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}