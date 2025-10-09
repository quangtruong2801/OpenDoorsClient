export type Application = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  resumeUrl: string;
  resumePublicId?: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  createdAt: string;
};

export type NewApplication = Omit<Application, "id" | "status" | "createdAt">;
