export interface Property {
  id: string;
  type: string;
  status: string;
  price: string;
  landArea: string;
  buildingArea: string;
  bedrooms: number;
  bathrooms: number;
  garage: boolean;
  location: string;
  colorType: string;
  colorStatus: string;
  imageUrl: string;
  imageUrls?: string[];
  phoneNumber: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparisonItem {
  property: Property;
  addedAt: Date;
}