import axios from "axios";
import type {
  Student,
  StudentFormData,
  Program,
  ProgramFormData,
  Enrollment,
  EnrollmentFormData,
} from "@/types";

const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Student API

export const studentApi = {
  getAll: async (): Promise<Student[]> => {
    const { data } = await api.get("/students");
    return data;
  },

  getById: async (nic: string): Promise<Student> => {
    const { data } = await api.get(`/students/${nic}`);
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

    const { data } = await api.post("/students", form, {
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

    const { data } = await api.put(`/students/${nic}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (nic: string): Promise<void> => {
    await api.delete(`/students/${nic}`);
  },

  getPictureUrl: (nic: string): string =>
    `/api/v1/students/${nic}/picture`,
};

// Program API

export const programApi = {
  getAll: async (): Promise<Program[]> => {
    const { data } = await api.get("/programs");
    return data;
  },

  getById: async (programId: string): Promise<Program> => {
    const { data } = await api.get(`/programs/${programId}`);
    return data;
  },

  create: async (body: ProgramFormData): Promise<Program> => {
    const { data } = await api.post("/programs", body);
    return data;
  },

  update: async (programId: string, body: ProgramFormData): Promise<Program> => {
    const { data } = await api.put(`/programs/${programId}`, body);
    return data;
  },

  delete: async (programId: string): Promise<void> => {
    await api.delete(`/programs/${programId}`);
  },
};

// Enrollment API

export const enrollmentApi = {
  getAll: async (): Promise<Enrollment[]> => {
    const { data } = await api.get("/enrollments");
    return data;
  },

  getById: async (id: number): Promise<Enrollment> => {
    const { data } = await api.get(`/enrollments/${id}`);
    return data;
  },

  getByProgram: async (programId: string): Promise<Enrollment[]> => {
    const { data } = await api.get("/enrollments", {
      params: { programId },
    });
    return data;
  },

  create: async (body: EnrollmentFormData): Promise<Enrollment> => {
    const { data } = await api.post("/enrollments", body);
    return data;
  },

  update: async (id: number, body: EnrollmentFormData): Promise<Enrollment> => {
    const { data } = await api.put(`/enrollments/${id}`, body);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/enrollments/${id}`);
  },
};
