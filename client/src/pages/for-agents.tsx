import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import Header from "@/components/header";
import logoPath from "@assets/cropped_1749956607943.png";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, ExternalLink, Zap, Code2, Key, Globe } from "lucide-react";

const BASE = "https://what-the-wine.vercel.app";

const CURL_REGISTER = `curl -X POST ${BASE}/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "agent@example.com",
    "username": "myagent",
    "firstName": "My",
    "lastName": "Agent",
    "password": "securepass"
  }'`;

const CURL_RECOMMEND = `curl -X POST ${BASE}/api/recommendations \\
  -H "Authorization: Bearer wtw_<your_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "wineType": "red",
    "budget": "$20-$40",
    "occasion": "dinner party",
    "foodPairing": "grilled lamb",
    "preferences": "dry, earthy, low tannins"
  }'`;

const PYTHON_EXAMPLE = `import requests

API_KEY = "wtw_<your_api_key>"
BASE_URL = "https://what-the-wine.vercel.app/api"

def recommend_wine(occasion, food, budget="$20-$40", wine_type="red"):
    resp = requests.post(
        f"{BASE_URL}/recommendations",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "occasion": occasion,
            "foodPairing": food,
            "budget": budget,
            "wineType": wine_type,
        },
    )
    resp.raise_for_status()
    return resp.json()["wines"]

wines = recommend_wine("dinner party", "grilled salmon", wine_type="white")
for w in wines:
    print(f"{w['name']} by {w['winery']} — ${w['price']}")`;

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-gray-950 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 p-1.5 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function ForAgents() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: apiKeyData } = useQuery<{ apiKey: string }>({
    queryKey: ["/api/user/api-key"],
    enabled: isAuthenticated,
  });

  useSEO({
    title: "API for AI Agents — Wine Intelligence",
    description: "Integrate What the Wine into your AI agent or app. Bearer token auth, OpenAPI spec, and structured wine data. Build wine recommendation workflows in minutes.",
    canonical: "/for-agents",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "name": "What the Wine API for AI Agents",
      "description": "REST API documentation for integrating wine recommendations into AI agents and applications.",
      "url": `${BASE}/for-agents`,
    },
  });

  const scrollToSection = () => {};

  const endpoints = [
    {
      method: "POST",
      path: "/api/recommendations",
      auth: true,
      description: "Get 3–5 AI-personalized wine suggestions. Pass occasion, food, budget, type, and taste preferences.",
    },
    {
      method: "GET",
      path: "/api/wines",
      auth: false,
      description: "Paginated list of wines from the database. Use limit and offset query params.",
    },
    {
      method: "GET",
      path: "/api/wines/search?q=",
      auth: false,
      description: "Full-text search across name, winery, region, and description.",
    },
    {
      method: "GET",
      path: "/api/wines/type/:type",
      auth: false,
      description: "Filter wines by type: red, white, rose, sparkling, or dessert.",
    },
    {
      method: "GET",
      path: "/api/community/recommendations",
      auth: false,
      description: "Community-shared wine picks with likes, occasion, and food pairing context.",
    },
    {
      method: "POST",
      path: "/api/analyze-bottle",
      auth: true,
      description: "Upload a wine label photo (multipart). Returns GPT-4 Vision identification with tasting notes.",
    },
    {
      method: "GET",
      path: "/api/library",
      auth: true,
      description: "Retrieve the authenticated user's saved wine library.",
    },
    {
      method: "GET",
      path: "/api/user/api-key",
      auth: true,
      description: "Returns your stable Bearer API key.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-burgundy-950">
      <Header onScrollTo={scrollToSection} />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <Badge className="mb-6 bg-burgundy-600 text-white border-0 px-4 py-1.5 text-sm">
          REST API · OpenAPI 3.1 · Bearer Auth
        </Badge>
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          Wine Intelligence,<br />
          <span className="text-burgundy-400">Built for Agents</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Give your AI agent the ability to recommend wine for any occasion, identify bottles, and search a curated wine database — all via a simple REST API with Bearer token auth.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-burgundy-600 hover:bg-burgundy-700 text-white px-8 py-3 text-base"
            >
              <Key className="w-4 h-4 mr-2" />
              Get My API Key
            </Button>
          ) : (
            <Button
              onClick={() => setLocation("/")}
              className="bg-burgundy-600 hover:bg-burgundy-700 text-white px-8 py-3 text-base"
            >
              Create Account & Get Key
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.open(`${BASE}/api/openapi.json`, "_blank")}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-base"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            OpenAPI Spec
          </Button>
        </div>
      </section>

      {/* Why agents love it */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Key className="w-6 h-6 text-burgundy-400" />, title: "Simple Bearer Auth", body: "No OAuth redirects, no refresh tokens. One API key, stable forever. Set it and forget it." },
            { icon: <Zap className="w-6 h-6 text-burgundy-400" />, title: "Structured Responses", body: "Clean JSON with typed fields. Wine objects include name, region, price, rating, food pairings, and tasting notes." },
            { icon: <Globe className="w-6 h-6 text-burgundy-400" />, title: "OpenAPI Native", body: "Full OpenAPI 3.1 spec at /api/openapi.json. Drop it into any tool-use agent or SDK generator." },
          ].map((f) => (
            <Card key={f.title} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* API Key */}
      {isAuthenticated && apiKeyData?.apiKey && (
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <Card className="bg-gray-900 border-burgundy-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-burgundy-400" />
                Your API Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Use this in every request as <code className="bg-gray-800 px-1.5 py-0.5 rounded text-burgundy-300">Authorization: Bearer &lt;key&gt;</code></p>
              <CodeBlock code={apiKeyData.apiKey} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Quick Start */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <Code2 className="w-6 h-6 text-burgundy-400" />
          Quick Start
        </h2>
        <div className="space-y-6">
          <div>
            <p className="text-gray-400 text-sm mb-3">
              <span className="text-white font-medium">Step 1</span> — Register an account (or log in at{" "}
              <a href="/" className="text-burgundy-400 hover:underline">what-the-wine.vercel.app</a>)
            </p>
            <CodeBlock code={CURL_REGISTER} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-3">
              <span className="text-white font-medium">Step 2</span> — Get your API key
            </p>
            <CodeBlock code={`curl ${BASE}/api/user/api-key \\\n  -H "Cookie: wtw_auth=<cookie_from_login>"`} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-3">
              <span className="text-white font-medium">Step 3</span> — Start recommending
            </p>
            <CodeBlock code={CURL_RECOMMEND} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-3">
              <span className="text-white font-medium">Python example</span>
            </p>
            <CodeBlock code={PYTHON_EXAMPLE} language="python" />
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-8">Available Endpoints</h2>
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <div key={ep.path} className="flex items-start gap-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 min-w-[200px]">
                <Badge className={`text-xs font-mono ${ep.method === "GET" ? "bg-green-900 text-green-300" : ep.method === "POST" ? "bg-blue-900 text-blue-300" : "bg-gray-800 text-gray-300"}`}>
                  {ep.method}
                </Badge>
                {ep.auth && (
                  <Badge className="text-xs bg-burgundy-900 text-burgundy-300 border-0">auth</Badge>
                )}
              </div>
              <div className="flex-1">
                <code className="text-burgundy-300 text-sm font-mono">{ep.path}</code>
                <p className="text-gray-400 text-sm mt-1">{ep.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => window.open(`${BASE}/api/openapi.json`, "_blank")}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Full OpenAPI 3.1 Spec
          </Button>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-8">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Free</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-400 text-sm">
              <p>✓ 5 AI recommendations</p>
              <p>✓ Unlimited wine search and browse</p>
              <p>✓ Community recommendations</p>
              <p>✓ API key access</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-burgundy-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Premium
                <Badge className="bg-burgundy-600 text-white border-0">$3.99/mo</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-400 text-sm">
              <p>✓ <strong className="text-white">Unlimited</strong> AI recommendations</p>
              <p>✓ Bottle label scanning (GPT-4 Vision)</p>
              <p>✓ Personal wine library (save, annotate)</p>
              <p>✓ Community features</p>
              <p>✓ Priority support</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-20 text-center">
        <div className="bg-gradient-to-r from-burgundy-900 to-gray-900 border border-burgundy-700 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to build?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Create an account, grab your API key, and make your first recommendation call in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/")}
              className="bg-burgundy-600 hover:bg-burgundy-700 text-white px-8"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("/llms.txt", "_blank")}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Read llms.txt
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="What the Wine" className="h-7 w-7 object-contain" />
            <span className="text-gray-400 text-sm">What the Wine</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="/help" className="hover:text-gray-300 transition-colors">Help</a>
            <a href="/contact" className="hover:text-gray-300 transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="/api/openapi.json" target="_blank" className="hover:text-gray-300 transition-colors">OpenAPI</a>
            <a href="/llms.txt" target="_blank" className="hover:text-gray-300 transition-colors">llms.txt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
