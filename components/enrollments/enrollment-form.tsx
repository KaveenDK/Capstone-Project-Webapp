"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { studentApi, programApi } from "@/lib/api";
import type { Student, Program, Enrollment } from "@/types";

const schema = z.object({
  studentId: z.string().min(1, "Student is required"),
  programId: z.string().min(1, "Program is required"),
  date: z.string().min(1, "Date is required"),
});

export type EnrollmentFormValues = z.infer<typeof schema>;

interface Props {
  enrollment?: Enrollment;
  onSubmit: (values: EnrollmentFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function EnrollmentForm({ enrollment, onSubmit, onCancel, loading }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([studentApi.getAll(), programApi.getAll()])
      .then(([s, p]) => {
        setStudents(s);
        setPrograms(p);
      })
      .finally(() => setFetching(false));
  }, []);

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: enrollment?.studentId ?? "",
      programId: enrollment?.programId ?? "",
      date: enrollment?.date ?? new Date().toISOString().split("T")[0],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={fetching}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={fetching ? "Loading…" : "Select a student"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.nic} value={s.nic}>
                      {s.name}{" "}
                      <span className="text-slate-400 text-xs">({s.nic})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="programId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={fetching}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={fetching ? "Loading…" : "Select a program"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.programId} value={p.programId}>
                      {p.programId} – {p.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enrollment Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || fetching}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {enrollment ? "Update Enrollment" : "Create Enrollment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
