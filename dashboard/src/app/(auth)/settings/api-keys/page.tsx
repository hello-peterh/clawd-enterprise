"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Plus, Trash2, X, Copy, AlertTriangle } from "lucide-react";

interface ApiKeyData {
  id: string;
  prefix: string;
  name: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const AVAILABLE_SCOPES = ["read", "write", "admin"];

const initialKeys: ApiKeyData[] = [
  {
    id: "key_1",
    prefix: "ce_a3b8f12d",
    name: "Production API",
    scopes: ["read", "write"],
    lastUsedAt: "2026-02-21T18:30:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "key_2",
    prefix: "ce_7e4c9a01",
    name: "CI/CD Pipeline",
    scopes: ["read"],
    lastUsedAt: "2026-02-22T02:00:00Z",
    expiresAt: null,
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "key_3",
    prefix: "ce_f5d2b89e",
    name: "Development Testing",
    scopes: ["read", "write", "admin"],
    lastUsedAt: null,
    expiresAt: "2026-06-30T23:59:59Z",
    createdAt: "2026-02-10T14:00:00Z",
  },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>(initialKeys);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([]);
  const [newKeyExpiry, setNewKeyExpiry] = useState("90");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function toggleScope(scope: string) {
    setNewKeyScopes((prev) =>
      prev.includes(scope)
        ? prev.filter((s) => s !== scope)
        : [...prev, scope]
    );
  }

  function handleGenerate() {
    if (!newKeyName.trim() || newKeyScopes.length === 0) return;

    // Simulate key generation
    const mockKey =
      "ce_" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    const prefix = mockKey.slice(0, 11);

    const expiresAt =
      newKeyExpiry === "never"
        ? null
        : new Date(
            Date.now() + parseInt(newKeyExpiry) * 24 * 60 * 60 * 1000
          ).toISOString();

    const newApiKey: ApiKeyData = {
      id: `key_${Date.now()}`,
      prefix,
      name: newKeyName.trim(),
      scopes: newKeyScopes,
      lastUsedAt: null,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    setKeys((prev) => [...prev, newApiKey]);
    setGeneratedKey(mockKey);
  }

  function handleCopy() {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleCloseGenerate() {
    setShowGenerateForm(false);
    setGeneratedKey(null);
    setNewKeyName("");
    setNewKeyScopes([]);
    setNewKeyExpiry("90");
    setCopied(false);
  }

  function handleRevoke(id: string) {
    if (
      confirm(
        "Are you sure you want to revoke this API key? This action cannot be undone."
      )
    ) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access
          </p>
        </div>
        <Button onClick={() => setShowGenerateForm(true)}>
          <Plus className="h-4 w-4" />
          Generate New Key
        </Button>
      </div>

      {/* Generate Key Form */}
      {showGenerateForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {generatedKey ? "API Key Generated" : "Generate New API Key"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseGenerate}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedKey ? (
              <>
                {/* Show generated key */}
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">
                        Copy your API key now. You will not be able to see it
                        again.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm break-all">
                    {generatedKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-3 w-3" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <Button onClick={handleCloseGenerate}>Done</Button>
              </>
            ) : (
              <>
                {/* Key name */}
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g. Production API"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>

                {/* Scopes */}
                <div className="space-y-2">
                  <Label>Scopes</Label>
                  <div className="flex gap-3">
                    {AVAILABLE_SCOPES.map((scope) => (
                      <label
                        key={scope}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          checked={newKeyScopes.includes(scope)}
                          onChange={() => toggleScope(scope)}
                          className="rounded"
                        />
                        <span className="capitalize">{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Expiry */}
                <div className="space-y-2">
                  <Label htmlFor="key-expiry">Expiration</Label>
                  <select
                    id="key-expiry"
                    value={newKeyExpiry}
                    onChange={(e) => setNewKeyExpiry(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleGenerate}>Generate Key</Button>
                  <Button variant="outline" onClick={handleCloseGenerate}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Active API Keys
          </CardTitle>
          <CardDescription>
            {keys.length} key{keys.length !== 1 ? "s" : ""} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Key
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Scopes
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Last Used
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Expires
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {keys.map((apiKey) => (
                  <tr key={apiKey.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {apiKey.prefix}...
                      </code>
                    </td>
                    <td className="py-3 pr-4 font-medium">{apiKey.name}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1">
                        {apiKey.scopes.map((scope) => (
                          <Badge key={scope} variant="secondary">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {apiKey.lastUsedAt
                        ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="py-3 pr-4">
                      {apiKey.expiresAt ? (
                        <span
                          className={
                            new Date(apiKey.expiresAt) < new Date()
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }
                        >
                          {new Date(apiKey.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </td>
                    <td className="py-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(apiKey.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
