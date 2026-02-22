"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Tab types ---
type Tab = "general" | "security" | "models" | "notifications";

const tabs: { id: Tab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "models", label: "Models" },
  { id: "notifications", label: "Notifications" },
];

// --- Form types ---
interface GeneralForm {
  instanceName: string;
  description: string;
  timezone: string;
}

interface SecurityForm {
  minPasswordLength: number;
  requireUppercase: boolean;
  sessionTimeout: string;
}

interface ModelsForm {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

interface NotificationsForm {
  emailNotifications: boolean;
  webhookUrl: string;
}

// --- General Tab ---
function GeneralTab({ onSave }: { onSave: () => void }) {
  const { register, handleSubmit } = useForm<GeneralForm>({
    defaultValues: {
      instanceName: "Clawd Enterprise",
      description: "Production AI assistant instance",
      timezone: "UTC",
    },
  });

  function onSubmit(data: GeneralForm) {
    console.log("General settings saved:", data);
    onSave();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Configure your Clawd Enterprise instance details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName">Instance Name</Label>
            <Input id="instanceName" {...register("instanceName")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("timezone")}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">GMT (London)</option>
              <option value="Europe/Berlin">CET (Berlin)</option>
              <option value="Asia/Tokyo">JST (Tokyo)</option>
            </select>
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Security Tab ---
function SecurityTab({ onSave }: { onSave: () => void }) {
  const { register, handleSubmit, watch, setValue } = useForm<SecurityForm>({
    defaultValues: {
      minPasswordLength: 8,
      requireUppercase: true,
      sessionTimeout: "30",
    },
  });

  const requireUppercase = watch("requireUppercase");

  function onSubmit(data: SecurityForm) {
    console.log("Security settings saved:", data);
    onSave();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure password policies and session management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
            <Input
              id="minPasswordLength"
              type="number"
              min={6}
              max={128}
              {...register("minPasswordLength", { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="requireUppercase">Require Uppercase</Label>
              <p className="text-sm text-muted-foreground">
                Passwords must contain at least one uppercase letter
              </p>
            </div>
            <button
              id="requireUppercase"
              type="button"
              role="switch"
              aria-checked={requireUppercase}
              onClick={() => setValue("requireUppercase", !requireUppercase)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                requireUppercase ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                  requireUppercase ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout</Label>
            <select
              id="sessionTimeout"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("sessionTimeout")}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
              <option value="1440">24 hours</option>
            </select>
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Models Tab ---
function ModelsTab({ onSave }: { onSave: () => void }) {
  const { register, handleSubmit } = useForm<ModelsForm>({
    defaultValues: {
      defaultModel: "claude-sonnet",
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt:
        "You are Clawd, a helpful enterprise AI assistant. Be concise, accurate, and professional.",
    },
  });

  function onSubmit(data: ModelsForm) {
    console.log("Model settings saved:", data);
    onSave();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Configuration</CardTitle>
        <CardDescription>
          Configure the default AI model and parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultModel">Default Model</Label>
            <select
              id="defaultModel"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("defaultModel")}
            >
              <option value="claude-sonnet">Claude Sonnet</option>
              <option value="claude-haiku">Claude Haiku</option>
              <option value="claude-opus">Claude Opus</option>
              <option value="gpt-4o">GPT-4o</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (0-2)</Label>
            <Input
              id="temperature"
              type="number"
              min={0}
              max={2}
              step={0.1}
              {...register("temperature", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              min={1}
              max={200000}
              {...register("maxTokens", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <textarea
              id="systemPrompt"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("systemPrompt")}
            />
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Notifications Tab ---
function NotificationsTab({ onSave }: { onSave: () => void }) {
  const { register, handleSubmit, watch, setValue } = useForm<NotificationsForm>({
    defaultValues: {
      emailNotifications: true,
      webhookUrl: "",
    },
  });

  const emailNotifications = watch("emailNotifications");

  function onSubmit(data: NotificationsForm) {
    console.log("Notification settings saved:", data);
    onSave();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how you receive alerts and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for important events
              </p>
            </div>
            <button
              id="emailNotifications"
              type="button"
              role="switch"
              aria-checked={emailNotifications}
              onClick={() => setValue("emailNotifications", !emailNotifications)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                emailNotifications ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                  emailNotifications ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              placeholder="https://example.com/webhook"
              {...register("webhookUrl")}
            />
            <p className="text-xs text-muted-foreground">
              Events will be POSTed to this URL as JSON payloads
            </p>
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Main Settings Page ---
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [showSaved, setShowSaved] = useState(false);

  function handleSave() {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure your Clawd Enterprise instance
        </p>
      </div>

      {showSaved && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Settings saved!
        </div>
      )}

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "general" && <GeneralTab onSave={handleSave} />}
      {activeTab === "security" && <SecurityTab onSave={handleSave} />}
      {activeTab === "models" && <ModelsTab onSave={handleSave} />}
      {activeTab === "notifications" && <NotificationsTab onSave={handleSave} />}
    </div>
  );
}
