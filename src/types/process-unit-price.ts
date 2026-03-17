export interface ProcessUnitPrice {
  id?: string;
  province?: string;
  city?: string;
  provinceId?: string;
  cityId?: string;
  type?: string; // human/machine/material or backend defined
  name?: string;
  conserveId?: string;
  unit?: string;
  organizationId?: string;
  organizationName?: string;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProcessUnitPricePageRequest {
  page: number;
  rows: number;
  provinceId?: string;
  cityId?: string;
  type?: string;
  name?: string;
  conserveId?: string;
  organizationId?: string;
}
