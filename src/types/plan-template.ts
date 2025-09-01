export interface PlanTemplate {
  id?: number;
  organizationId?: number;
  organizationName?: string;
  month?: number;
  type?: string;
  description?: string;
  suggestions?: string;
  intelligentSuggestions?: string;
  inputLabor?: number;
  workload?: number;
  finishStandards?: string;
  province?: string;
  city?: string;
  county?: string;
  provinceId?: number;
  cityId?: number;
  countyId?: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
  deletedAt?: string; // date-time
}

