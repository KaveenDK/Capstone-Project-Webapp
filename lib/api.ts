import axios from "axios";
import type {
  Student,
  StudentFormData,
  Program,
  ProgramFormData,
  Enrollment,
  EnrollmentFormData,
} from "@/types";

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:7000";

const api = axios.create({
  baseURL: API_GATEWAY,
  headers: { "Content-Type": "application/json" },
});

// ─── Student API ───────────────────────────────────────────────────────────────

export const studentApi = {
  getAll: async (): Promise<Student[]> => {
    const { data } = await api.get("/api/v1/students");
    return data;
  },

  getById: async (nic: string): Promise<Student> => {
    const { data } = await api.get(`/api/v1/students/${nic}`);
    return data;
  },

  create: async (formData: StudentFormData): Promise<Student> => {
    const form = new FormData();
    form.append("nic", formData.nic);
    form.append("name", formData.name);
    form.append("address", formData.address);
    form.append("mobile", formData.mobile);
    if (formData.email) form.append("email", formData.email);
    if (formData.picture) form.append("picture", formData.picture);

    const { data } = await api.post("/api/v1/students", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (nic: string, formData: StudentFormData): Promise<Student> => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("address", formData.address);
    form.append("mobile", formData.mobile);
    if (formData.email) form.append("email", formData.email);
    if (formData.picture) form.append("picture", formData.picture);

    const { data } = await api.put(`/api/v1/students/${nic}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (nic: string): Promise<void> => {
    await api.delete(`/api/v1/students/${nic}`);
  },

  getPictureUrl: (nic: string): string =>
    `${API_GATEWAY}/api/v1/students/${nic}/picture`,
};

// ─── Program API ───────────────────────────────────────────────────────────────

export const programApi = {
  getAll: async (): Promise<Program[]> => {
    const { data } = await api.get("/api/v1/programs");
    return data;
  },

  getById: async (programId: string): Promise<Program> => {
    const { data } = await api.get(`/api/v1/programs/${programId}`);
    return data;
  },

  create: async (body: ProgramFormData): Promise<Program> => {
    const { data } = await api.post("/api/v1/programs", body);
    return data;
  },

  update: async (programId: string, body: ProgramFormData): Promise<Program> => {
    const { data } = await api.put(`/api/v1/programs/${programId}`, body);
    return data;
  },

  delete: async (programId: string): Promise<void> => {
    await api.delete(`/api/v1/programs/${programId}`);
  },
};

// ─── Enrollment API ────────────────────────────────────────────────────────────

export const enrollmentApi = {
  getAll: async (): Promise<Enrollment[]> => {
    const { data } = await api.get("/api/v1/enrollments");
    return data;
  },

  getById: async (id: number): Promise<Enrollment> => {
    const { data } = await api.get(`/api/v1/enrollments/${id}`);
    return data;
  },

  getByProgram: async (programId: string): Promise<Enrollment[]> => {
    const { data } = await api.get("/api/v1/enrollments", {
      params: { programId },
    });
    return data;
  },

  create: async (body: EnrollmentFormData): Promise<Enrollment> => {
    const { data } = await api.post("/api/v1/enrollments", body);
    return data;
  },

  update: async (id: number, body: EnrollmentFormData): Promise<Enrollment> => {
    const { data } = await api.put(`/api/v1/enrollments/${id}`, body);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/enrollments/${id}`);
  },
};
