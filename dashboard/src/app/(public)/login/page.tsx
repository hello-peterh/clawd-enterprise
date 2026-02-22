"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sparkles, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen animate-clawd-fade-in">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Grid pattern overlay */}
        <div className="clawd-grid-pattern absolute inset-0" />

        {/* Floating dots */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/20"
              style={{
                left: `${(i * 17 + 5) % 100}%`,
                top: `${(i * 23 + 10) % 100}%`,
                animation: `clawd-dot-float ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-white">
            Clawd Enterprise
          </h1>
          <p className="text-lg text-violet-100">
            Enterprise AI Assistant Platform
          </p>
          <div className="mt-12 space-y-4 text-left">
            <div className="flex items-start gap-3 rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-white">30+ Integrations</p>
                <p className="text-xs text-violet-200">
                  Connect Slack, Teams, Discord, and more
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-white">Enterprise RBAC</p>
                <p className="text-xs text-violet-200">
                  Role-based access control with audit logging
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-white">AI-Powered</p>
                <p className="text-xs text-violet-200">
                  Multi-model support with intelligent routing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Clawd Enterprise</span>
          </div>

          <Card className="animate-clawd-slide-up border-0 shadow-lg lg:border lg:shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="rounded-md bg-rose-50 px-3 py-2 dark:bg-rose-950/50">
                    <p className="text-sm text-rose-600 dark:text-rose-400">
                      {error}
                    </p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-700 hover:to-violet-800 dark:from-violet-600 dark:to-violet-700 dark:hover:from-violet-500 dark:hover:to-violet-600 shadow-md shadow-violet-500/20"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Powered by{" "}
            <span className="font-medium text-violet-600 dark:text-violet-400">
              Clawd
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
