"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { studentApi } from "@/lib/api";
import type { Student } from "@/types";
import { StudentForm } from "@/components/students/student-form";

function StudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [viewTarget, setViewTarget] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentApi.getAll();
      setStudents(data);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditTarget(undefined);
      setFormOpen(true);
    }
  }, [searchParams]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nic.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search)
  );

  const openNew = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditTarget(student);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    router.replace("/students");
  };

  const handleFormSubmit = async (
    values: {
      nic: string;
      name: string;
      address: string;
      mobile: string;
      email?: string;
    },
    picture?: File
  ) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await studentApi.update(editTarget.nic, { ...values, picture });
        toast.success("Student updated successfully");
      } else {
        await studentApi.create({ ...values, picture });
        toast.success("Student created successfully");
      }
      handleFormClose();
      fetchStudents();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Operation failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await studentApi.delete(deleteTarget.nic);
      toast.success("Student deleted");
      setDeleteOpen(false);
      fetchStudents();
    } catch {
      toast.error("Failed to delete student");
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
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search by name, NIC or mobile…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openNew} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Student</TableHead>
                <TableHead>NIC</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    {search ? "No matching students found" : "No students yet. Add one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student) => (
                  <TableRow key={student.nic} className="hover:bg-slate-50">
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={studentApi.getPictureUrl(student.nic)}
                          alt={student.name}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                          {initials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[160px]">
                          {student.address}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {student.nic}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{student.mobile}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {student.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewTarget(student)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setDeleteTarget(student); setDeleteOpen(true); }}
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
        <p className="text-xs text-slate-400">
          {filtered.length} student{filtered.length !== 1 ? "s" : ""} shown
        </p>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && handleFormClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <StudentForm
            student={editTarget}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24 border-2 border-blue-200">
                  <AvatarImage
                    src={studentApi.getPictureUrl(viewTarget.nic)}
                    alt={viewTarget.name}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                    {initials(viewTarget.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{viewTarget.name}</h3>
                <Badge variant="outline" className="font-mono">{viewTarget.nic}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Mobile", value: viewTarget.mobile },
                  { label: "Email", value: viewTarget.email ?? "—" },
                  { label: "Address", value: viewTarget.address },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-right max-w-[180px]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setViewTarget(null);
                    openEdit(viewTarget);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setDeleteTarget(viewTarget);
                    setDeleteOpen(true);
                    setViewTarget(null);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong> ({deleteTarget?.nic})?
              This action cannot be undone.
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

export default function StudentsPage() {
  return (
    <Suspense>
      <StudentsContent />
    </Suspense>
  );
}
