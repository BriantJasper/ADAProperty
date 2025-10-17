export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  subLocation: string;
  type: "rumah" | "apartemen" | "tanah" | "ruko";
  status: "dijual" | "disewa";
  bedrooms: number;
  bathrooms: number;
  area: number;
  landArea?: number;
  images: string[];
  features: string[];
  whatsappNumber: string;
  igUrl?: string;
  tiktokUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparisonItem {
  property: Property;
  addedAt: Date;
}
