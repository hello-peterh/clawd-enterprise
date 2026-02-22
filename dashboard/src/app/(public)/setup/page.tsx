"use client";

import { useState, useMemo } from "react";
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
import {
  Sparkles,
  User,
  Building2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  orgName: string;
  orgSlug: string;
}

const steps = [
  { id: 1, label: "Admin Account", icon: User },
  { id: 2, label: "Organization", icon: Building2 },
  { id: 3, label: "Complete", icon: CheckCircle2 },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export default function SetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    orgName: "",
    orgSlug: "",
  });

  const autoSlug = useMemo(() => slugify(formData.orgName), [formData.orgName]);

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function validateStep1(): boolean {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    if (!formData.orgName.trim()) {
      setError("Organization name is required");
      return false;
    }
    return true;
  }

  function handleNext() {
    setError(null);
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    if (currentStep === 2) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    setError(null);
    setCurrentStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          orgName: formData.orgName,
          orgSlug: formData.orgSlug || autoSlug,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Setup failed");
        setLoading(false);
        return;
      }

      setCurrentStep(3);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20 px-4">
      <div className="w-full max-w-lg animate-clawd-fade-in">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Clawd Enterprise</span>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    currentStep > step.id
                      ? "border-violet-600 bg-violet-600 text-white"
                      : currentStep === step.id
                        ? "border-violet-600 bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-400"
                        : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step.id
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-3 mb-6 h-0.5 w-16 rounded-full transition-colors duration-300 ${
                    currentStep > step.id
                      ? "bg-violet-600 dark:bg-violet-400"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card className="shadow-xl border-0 lg:border animate-clawd-scale-in">
          {/* Step 1: Admin Account */}
          {currentStep === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Create Admin Account</CardTitle>
                <CardDescription>
                  Set up the super administrator for your instance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Jane Admin"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="admin@company.com"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Min. 8 characters"
                      className="h-10 pr-10"
                      minLength={8}
                      required
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
                  {formData.password.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            formData.password.length >= level * 3
                              ? formData.password.length >= 12
                                ? "bg-emerald-500"
                                : formData.password.length >= 8
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    placeholder="Re-enter your password"
                    className="h-10"
                    minLength={8}
                    required
                  />
                  {formData.confirmPassword.length > 0 &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-rose-500">
                        Passwords do not match
                      </p>
                    )}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Organization */}
          {currentStep === 2 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">
                  Set Up Your Organization
                </CardTitle>
                <CardDescription>
                  Configure your organization details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={formData.orgName}
                    onChange={(e) => updateField("orgName", e.target.value)}
                    placeholder="Acme Corporation"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgSlug">Organization Slug</Label>
                  <Input
                    id="orgSlug"
                    value={formData.orgSlug || autoSlug}
                    onChange={(e) => updateField("orgSlug", e.target.value)}
                    placeholder="acme-corporation"
                    className="h-10 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from organization name. You can customize it.
                  </p>
                </div>

                <div className="mt-4 rounded-lg bg-violet-50 p-4 dark:bg-violet-950/30 ring-1 ring-violet-100 dark:ring-violet-800/50">
                  <h4 className="text-sm font-medium text-violet-900 dark:text-violet-300">
                    What happens next?
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-violet-700 dark:text-violet-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>Your admin account will be created</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>The organization will be initialized</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>You can then configure channels and invite users</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Success */}
          {currentStep === 3 && (
            <>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                  <svg
                    className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      className="animate-clawd-checkmark"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl">You are all set!</CardTitle>
                <CardDescription>
                  Your Clawd Enterprise instance is ready to go
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Admin</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium">{formData.orgName}</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="px-6 pb-6">
            {error && (
              <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 dark:bg-rose-950/50">
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              {currentStep > 1 && currentStep < 3 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  className="gap-1.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-700 hover:to-violet-800 dark:from-violet-600 dark:to-violet-700 dark:hover:from-violet-500 dark:hover:to-violet-600 shadow-md shadow-violet-500/20"
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
                      Setting up...
                    </span>
                  ) : (
                    <>
                      {currentStep === 2 ? "Complete Setup" : "Next"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full gap-1.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-700 hover:to-violet-800 dark:from-violet-600 dark:to-violet-700 dark:hover:from-violet-500 dark:hover:to-violet-600 shadow-md shadow-violet-500/20"
                >
                  <Sparkles className="h-4 w-4" />
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <span className="font-medium text-violet-600 dark:text-violet-400">
            Clawd
          </span>
        </p>
      </div>
    </div>
  );
}
