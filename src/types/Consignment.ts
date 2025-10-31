export type ConsignmentStatus = "pending" | "reviewed" | "approved";

export interface ConsignmentRequest {
  id: string;
  sellerName: string;
  sellerWhatsapp: string;
  title: string;
  description: string;
  price?: number;
  location: string;
  subLocation?: string;
  type?: "rumah" | "apartemen" | "tanah" | "ruko";
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  landArea?: number;
  floors?: number;
  images?: string[]; // data URLs untuk preview (maks 5)
  createdAt: Date;
  status: ConsignmentStatus;
}