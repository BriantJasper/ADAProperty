export interface FinancingParams {
  dpPercent: number; // Persentase DP (5–50)
  tenorYears: number; // Tenor cicilan dalam tahun (5–30)
  fixedYears: number; // Periode bunga fix dalam tahun (1–10)
  bookingFee: number; // Booking fee (rupiah)
  ppnPercent?: number; // PPN (%), default 11, dapat diubah 0–100
  interestRate?: number; // Annual interest rate (%), default 5
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  subLocation: string;
  type:
    | "rumah"
    | "apartemen"
    | "tanah"
    | "ruko"
    | "gudang"
    | "kavling"
    | "pabrik"
    | string;
  status: "dijual" | "disewa";
  typeColor?: string;
  statusColor?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  landArea?: number;
  floors?: number;
  garage?: number;
  // Ditandai untuk ditampilkan di bagian "Pilihan Populer" (home)
  isFeatured?: boolean;
  images: string[];
  features: string[];
  whatsappNumber: string;
  igUrl?: string;
  tiktokUrl?: string;
  tourUrl?: string;
  financing?: FinancingParams;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparisonItem {
  property: Property;
  addedAt: Date;
}
