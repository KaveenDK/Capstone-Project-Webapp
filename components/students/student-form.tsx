"use client";

import { useRef, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2 } from "lucide-react";
import type { Student } from "@/types";
import { studentApi } from "@/lib/api";

const schema = z.object({
  nic: z
    .string()
    .regex(/^\d{9}[vV]$/, "NIC must be 9 digits followed by V (e.g. 123456789V)"),
  name: z
    .string()
    .regex(/^[a-zA-Z][a-zA-Z ]*$/, "Name must contain letters and spaces only"),
  address: z.string().min(1, "Address is required"),
  mobile: z.string().min(1, "Mobile number is required"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  student?: Student;
  onSubmit: (values: FormValues, picture?: File) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function StudentForm({ student, onSubmit, onCancel, loading }: Props) {
  const [picture, setPicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nic: student?.nic ?? "",
      name: student?.name ?? "",
      address: student?.address ?? "",
      mobile: student?.mobile ?? "",
      email: student?.email ?? "",
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicture(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values, picture ?? undefined);
  };

  const initials = (student?.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={preview ?? (student ? studentApi.getPictureUrl(student.nic) : undefined)} />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileRef}
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            {picture ? "Change Photo" : "Upload Photo"}
          </Button>
          {!student && (
            <p className="text-xs text-slate-400">Photo required for new student</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nic"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>NIC *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123456789V"
                    {...field}
                    disabled={!!student}
                    className={student ? "bg-slate-50" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Mobile *</FormLabel>
                <FormControl>
                  <Input placeholder="0771234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, Colombo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {student ? "Update Student" : "Create Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
