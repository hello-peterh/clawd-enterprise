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
import { Building, Plus, Shield, X } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  userCount: number;
  createdAt: string;
  active: boolean;
}

const initialOrgs: Organization[] = [
  {
    id: "org_1",
    name: "Acme Corporation",
    slug: "acme-corp",
    userCount: 42,
    createdAt: "2025-06-15",
    active: true,
  },
  {
    id: "org_2",
    name: "Globex Industries",
    slug: "globex",
    userCount: 18,
    createdAt: "2025-08-22",
    active: true,
  },
  {
    id: "org_3",
    name: "Initech Solutions",
    slug: "initech",
    userCount: 7,
    createdAt: "2025-10-01",
    active: false,
  },
  {
    id: "org_4",
    name: "Umbrella Corp",
    slug: "umbrella",
    userCount: 156,
    createdAt: "2025-03-10",
    active: true,
  },
  {
    id: "org_5",
    name: "Stark Industries",
    slug: "stark",
    userCount: 89,
    createdAt: "2025-01-05",
    active: true,
  },
];

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>(initialOrgs);
  const [showDialog, setShowDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  function toggleActive(id: string) {
    setOrgs((prev) =>
      prev.map((org) =>
        org.id === id ? { ...org, active: !org.active } : org
      )
    );
  }

  function handleAdd() {
    if (!newName.trim() || !newSlug.trim()) return;
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name: newName.trim(),
      slug: newSlug.trim().toLowerCase().replace(/\s+/g, "-"),
      userCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      active: true,
    };
    setOrgs((prev) => [...prev, newOrg]);
    setNewName("");
    setNewSlug("");
    setShowDialog(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">
            Manage multi-tenant organizations
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Organization
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Super Admin Access</CardTitle>
          </div>
          <CardDescription>
            This page is restricted to SUPER_ADMIN users. Organization management
            controls multi-tenant access and configuration.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Add Organization Dialog */}
      {showDialog && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Organization</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                placeholder="Acme Corporation"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                placeholder="acme-corp"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Create Organization</Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
          <CardDescription>
            {orgs.length} organizations registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Slug
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Users
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{org.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {org.slug}
                      </code>
                    </td>
                    <td className="py-3 pr-4">{org.userCount}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {org.createdAt}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={org.active ? "default" : "secondary"}
                      >
                        {org.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(org.id)}
                      >
                        {org.active ? "Deactivate" : "Activate"}
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
