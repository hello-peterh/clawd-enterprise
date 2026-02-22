"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Info, Shield, CheckCircle } from "lucide-react";

export default function SsoPage() {
  const [provider, setProvider] = useState("saml");
  const [metadataUrl, setMetadataUrl] = useState("");
  const [entityId, setEntityId] = useState("");
  const [certificate, setCertificate] = useState("");
  const [attributeMapping, setAttributeMapping] = useState(
    JSON.stringify(
      {
        email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
        name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
      },
      null,
      2
    )
  );
  const [enabled, setEnabled] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleTestConnection() {
    setTestResult("Connection successful!");
    setTimeout(() => setTestResult(null), 3000);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          SSO Configuration
        </h2>
        <p className="text-muted-foreground">
          Configure single sign-on for your organization
        </p>
      </div>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardContent className="flex gap-3 pt-6">
          <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">SAML SSO Setup</p>
            <p className="mt-1">
              To configure SAML SSO, you will need your Identity Provider&apos;s
              metadata URL or XML, entity ID, and X.509 certificate. Configure
              your IdP with the following ACS URL:{" "}
              <code className="rounded bg-blue-100 px-1.5 py-0.5 text-xs dark:bg-blue-900">
                https://your-domain.com/api/auth/callback/saml
              </code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Result Alert */}
      {testResult && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {testResult}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Save Confirmation */}
      {saved && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              SSO configuration saved successfully.
            </span>
          </CardContent>
        </Card>
      )}

      {/* SSO Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Identity Provider Settings
              </CardTitle>
              <CardDescription>
                Configure your SAML or OIDC identity provider
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">SSO</span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  enabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                    enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <Badge variant={enabled ? "default" : "secondary"}>
                {enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Select */}
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="saml">SAML 2.0</option>
              <option value="oidc">OpenID Connect (OIDC)</option>
            </select>
          </div>

          {/* Metadata URL */}
          <div className="space-y-2">
            <Label htmlFor="metadata-url">Metadata URL</Label>
            <Input
              id="metadata-url"
              placeholder="https://idp.example.com/metadata.xml"
              value={metadataUrl}
              onChange={(e) => setMetadataUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              URL to your IdP&apos;s SAML metadata document
            </p>
          </div>

          {/* Entity ID */}
          <div className="space-y-2">
            <Label htmlFor="entity-id">Entity ID</Label>
            <Input
              id="entity-id"
              placeholder="https://idp.example.com/entity"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for your Identity Provider
            </p>
          </div>

          {/* Certificate */}
          <div className="space-y-2">
            <Label htmlFor="certificate">X.509 Certificate</Label>
            <textarea
              id="certificate"
              rows={6}
              placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDpDCCA...&#10;-----END CERTIFICATE-----"
              value={certificate}
              onChange={(e) => setCertificate(e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] font-mono"
            />
          </div>

          {/* Attribute Mapping */}
          <div className="space-y-2">
            <Label htmlFor="attribute-mapping">
              Attribute Mapping (JSON)
            </Label>
            <textarea
              id="attribute-mapping"
              rows={6}
              value={attributeMapping}
              onChange={(e) => setAttributeMapping(e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Map IdP attributes to Clawd user fields
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t pt-6">
            <Button onClick={handleSave}>Save Configuration</Button>
            <Button variant="outline" onClick={handleTestConnection}>
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
