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
import { Label } from "@/components/ui/label";
import {
  HardDrive,
  Download,
  Trash2,
  Upload,
  Plus,
  AlertTriangle,
} from "lucide-react";

interface BackupData {
  id: string;
  filename: string;
  size: number;
  status: "completed" | "in_progress" | "failed";
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const initialBackups: BackupData[] = [
  {
    id: "bak_1",
    filename: "clawd-backup-2026-02-22-full.tar.gz",
    size: 157286400,
    status: "completed",
    createdAt: "2026-02-22T06:00:00Z",
  },
  {
    id: "bak_2",
    filename: "clawd-backup-2026-02-15-full.tar.gz",
    size: 142606336,
    status: "completed",
    createdAt: "2026-02-15T06:00:00Z",
  },
  {
    id: "bak_3",
    filename: "clawd-backup-2026-02-08-full.tar.gz",
    size: 138412032,
    status: "completed",
    createdAt: "2026-02-08T06:00:00Z",
  },
];

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupData[]>(initialBackups);
  const [creating, setCreating] = useState(false);

  function handleCreateBackup() {
    setCreating(true);
    const newBackup: BackupData = {
      id: `bak_${Date.now()}`,
      filename: `clawd-backup-${new Date().toISOString().split("T")[0]}-full.tar.gz`,
      size: Math.floor(Math.random() * 50000000) + 130000000,
      status: "in_progress",
      createdAt: new Date().toISOString(),
    };
    setBackups((prev) => [newBackup, ...prev]);

    // Simulate completion after 2 seconds
    setTimeout(() => {
      setBackups((prev) =>
        prev.map((b) =>
          b.id === newBackup.id ? { ...b, status: "completed" as const } : b
        )
      );
      setCreating(false);
    }, 2000);
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this backup?")) {
      setBackups((prev) => prev.filter((b) => b.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Backup & Restore
          </h2>
          <p className="text-muted-foreground">
            Create and manage database backups
          </p>
        </div>
        <Button onClick={handleCreateBackup} disabled={creating}>
          <Plus className="h-4 w-4" />
          {creating ? "Creating..." : "Create Backup"}
        </Button>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup History
          </CardTitle>
          <CardDescription>
            {backups.length} backup{backups.length !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Filename
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <code className="text-xs">{backup.filename}</code>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatBytes(backup.size)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          backup.status === "completed"
                            ? "default"
                            : backup.status === "in_progress"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {backup.status === "completed"
                          ? "Completed"
                          : backup.status === "in_progress"
                            ? "In Progress"
                            : "Failed"}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(backup.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={backup.status !== "completed"}
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(backup.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Import / Restore Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import / Restore
          </CardTitle>
          <CardDescription>
            Upload a backup file to restore your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Warning */}
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Warning: Restore will overwrite data</p>
                <p className="mt-1">
                  Restoring from a backup will replace all current data in the
                  database. This action cannot be undone. Make sure you have a
                  current backup before proceeding.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-file">Backup File</Label>
            <div className="flex items-center gap-3">
              <input
                id="backup-file"
                type="file"
                accept=".tar.gz,.sql,.dump"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              <Button variant="outline">
                <Upload className="h-4 w-4" />
                Restore
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted formats: .tar.gz, .sql, .dump
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
