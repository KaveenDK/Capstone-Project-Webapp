"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Filter } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { enrollmentApi, programApi, studentApi } from "@/lib/api";
import type { Enrollment, Program } from "@/types";
import {
  EnrollmentForm,
  type EnrollmentFormValues,
} from "@/components/enrollments/enrollment-form";

function EnrollmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Enrollment | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [enr, progs] = await Promise.all([
        enrollmentApi.getAll(),
        programApi.getAll(),
      ]);
      setEnrollments(enr);
      setPrograms(progs);
    } catch {
      toast.error("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditTarget(undefined);
      setFormOpen(true);
    }
  }, [searchParams]);

  const filtered = enrollments.filter((e) => {
    const matchesSearch =
      (e.student?.name ?? e.studentId)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      e.studentId.toLowerCase().includes(search.toLowerCase()) ||
      e.programId.toLowerCase().includes(search.toLowerCase());
    const matchesProgram =
      programFilter === "all" || e.programId === programFilter;
    return matchesSearch && matchesProgram;
  });

  const openNew = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const openEdit = (enrollment: Enrollment) => {
    setEditTarget(enrollment);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    router.replace("/enrollments");
  };

  const handleFormSubmit = async (values: EnrollmentFormValues) => {
    setSubmitting(true);
    try {
      if (editTarget?.id) {
        await enrollmentApi.update(editTarget.id, values);
        toast.success("Enrollment updated successfully");
      } else {
        await enrollmentApi.create(values);
        toast.success("Enrollment created successfully");
      }
      handleFormClose();
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await enrollmentApi.delete(deleteTarget.id);
      toast.success("Enrollment deleted");
      setDeleteOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to delete enrollment");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search student or program…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.programId} value={p.programId}>
                      {p.programId} – {p.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={openNew} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Enrollment
          </Button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>
            <strong className="text-slate-900">{filtered.length}</strong> enrollment
            {filtered.length !== 1 ? "s" : ""}
          </span>
          {programFilter !== "all" && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setProgramFilter("all")}
            >
              Program: {programFilter} ×
            </Badge>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-10">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>NIC</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-slate-400"
                  >
                    {search || programFilter !== "all"
                      ? "No matching enrollments"
                      : "No enrollments yet. Create one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50">
                    <TableCell className="text-slate-400 text-xs font-mono">
                      {e.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={studentApi.getPictureUrl(e.studentId)}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                            {initials(e.student?.name ?? e.studentId)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-900">
                          {e.student?.name ?? e.studentId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {e.studentId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {e.programId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(e.date)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setDeleteTarget(e); setDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && handleFormClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Enrollment" : "New Enrollment"}
            </DialogTitle>
          </DialogHeader>
          <EnrollmentForm
            enrollment={editTarget}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete enrollment{" "}
              <strong>#{deleteTarget?.id}</strong> for{" "}
              <strong>{deleteTarget?.student?.name ?? deleteTarget?.studentId}</strong>{" "}
              in program <strong>{deleteTarget?.programId}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function EnrollmentsPage() {
  return (
    <Suspense>
      <EnrollmentsContent />
    </Suspense>
  );
}
