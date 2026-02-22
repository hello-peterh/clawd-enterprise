"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Filter,
  ScrollText,
  X,
} from "lucide-react";

type AuditEntry = {
  id: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userName: string;
  userEmail: string;
  createdAt: Date;
};

const actionBadgeColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  "user.created": "default",
  "user.updated": "secondary",
  "user.deleted": "destructive",
  "user.role_changed": "default",
  "channel.started": "default",
  "channel.stopped": "secondary",
  "channel.start_failed": "destructive",
  "channel.stop_failed": "destructive",
  "settings.updated": "secondary",
};

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [cursors, setCursors] = useState<string[]>([]);

  const currentCursor = cursors.length > 0 ? cursors[cursors.length - 1] : undefined;

  const auditLog = trpc.audit.list.useQuery({
    limit: 25,
    cursor: currentCursor,
    action: actionFilter || undefined,
    userId: userFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const actions = trpc.audit.getActions.useQuery();
  const users = trpc.audit.getUsers.useQuery();

  const hasFilters = actionFilter || userFilter || dateFrom || dateTo;

  const clearFilters = () => {
    setActionFilter("");
    setUserFilter("");
    setDateFrom("");
    setDateTo("");
    setCursors([]);
  };

  const columns: ColumnDef<AuditEntry>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <div className="text-sm">
            <p>{date.toLocaleDateString()}</p>
            <p className="text-xs text-muted-foreground">
              {date.toLocaleTimeString()}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.userName}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.userEmail}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Badge
          variant={
            actionBadgeColors[row.original.action] ?? "outline"
          }
        >
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: "target",
      header: "Target",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-mono">
          {row.original.target ?? "--"}
        </span>
      ),
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const details = row.original.details;
        if (!details || Object.keys(details).length === 0) {
          return (
            <span className="text-sm text-muted-foreground">--</span>
          );
        }
        return (
          <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] truncate block">
            {JSON.stringify(details)}
          </code>
        );
      },
    },
  ];

  const table = useReactTable({
    data: auditLog.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
        <p className="text-muted-foreground">
          Track all administrative actions and security events
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Action
              </label>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v === "all" ? "" : v); setCursors([]); }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {actions.data?.map((action: string) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                User
              </label>
              <Select value={userFilter} onValueChange={(v) => { setUserFilter(v === "all" ? "" : v); setCursors([]); }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {users.data?.map((user: { id: string; label: string }) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCursors([]); }}
                className="w-[160px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCursors([]); }}
                className="w-[160px]"
              />
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9"
              >
                <X className="mr-1.5 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle>Audit Trail</CardTitle>
          </div>
          <CardDescription>
            Comprehensive log of all actions performed in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLog.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <ScrollText className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-muted-foreground">
                            {hasFilters
                              ? "No audit entries match your filters"
                              : "No audit entries yet"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  {cursors.length > 0
                    ? `Page ${cursors.length + 1}`
                    : "Page 1"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cursors.length === 0}
                    onClick={() =>
                      setCursors((prev) => prev.slice(0, -1))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!auditLog.data?.nextCursor}
                    onClick={() => {
                      if (auditLog.data?.nextCursor) {
                        setCursors((prev) => [
                          ...prev,
                          auditLog.data.nextCursor!,
                        ]);
                      }
                    }}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
